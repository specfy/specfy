import { RequestError } from '@octokit/request-error';
import { isTest, nanoid, schemaId, schemaOrgId, sentry } from '@specfy/core';
import { prisma } from '@specfy/db';
import { logEvent } from '@specfy/events';
import { Octokit } from '@specfy/github';
import {
  createGitHubActivity,
  createJobBackfillGithub,
  createJobDeploy,
  getOrgFromRequest,
  schemaGitHubSettings,
} from '@specfy/models';
import { z } from 'zod';

import type { PostSource } from '@specfy/models';

import {
  notFound,
  serverError,
  validationError,
} from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';
import { noQuery } from '../../../middlewares/noQuery.js';

import type { FastifyPluginCallback, FastifyRequest } from 'fastify';

const repoRegex = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
function QueryVal(req: FastifyRequest) {
  return z
    .object({
      orgId: schemaOrgId,
      projectId: schemaId,
      type: z.literal('github'),
      name: z.string().max(50),
      identifier: z.string().max(500).regex(repoRegex),
      settings: schemaGitHubSettings,
    })
    .strict()
    .partial({ name: true })
    .superRefine(valPermissions(req, 'owner'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post<PostSource>(
    '/',
    { preHandler: noQuery },
    async function (req, res) {
      const val = await QueryVal(req).safeParseAsync(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const me = req.me!;
      const body: PostSource['Body'] = val.data;
      const org = getOrgFromRequest(req, body.orgId)!;
      const accounts = await prisma.accounts.findFirst({
        where: { userId: me.id },
      });

      if (!isTest) {
        // Can't mock Octokit for some reason it still calls the API
        try {
          const octokit = new Octokit({ auth: accounts!.accessToken });

          const [owner, repo] = body.identifier.split('/');
          // Verify that the installation is accessible to the user
          // TODO: find a proper way to do this
          await octokit.rest.repos.get({ owner, repo });
        } catch (e: unknown) {
          if (e instanceof RequestError) {
            console.error(e);
            sentry.captureException(e);
            return notFound(res);
          }

          return serverError(res);
        }
      }

      const source = await prisma.$transaction(async (tx) => {
        const proj = await tx.projects.findUnique({
          where: { id: body.projectId },
        });
        if (!proj) {
          throw new Error('cant find project');
        }

        let links = proj.links;
        const url = `https://github.com/${body.identifier}`;
        if (body.identifier) {
          links.push({ title: 'GitHub', url });
        } else {
          links = links.filter(
            (link) => link.title === 'GitHub' && link.url === url
          );
        }

        await tx.projects.update({
          data: { links },
          where: { id: body.projectId },
        });

        const tmp = await tx.sources.create({
          data: {
            id: nanoid(),
            orgId: body.orgId,
            projectId: body.projectId,
            name: `GitHub ${body.identifier}`,
            type: 'github',
            identifier: body.identifier,
            settings: body.settings,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        const jobConfig = {
          orgId: body.orgId,
          projectId: body.projectId,
          userId: me.id,
          config: {
            sourceId: tmp.id,
            url: body.identifier,
            autoLayout: true,
            settings: body.settings,
          },
        };
        await Promise.all([
          createJobDeploy({ ...jobConfig, tx }),
          createJobBackfillGithub({ ...jobConfig, tx }),
          createGitHubActivity({
            action: 'Github.linked',
            org,
            project: proj,
            tx,
            user: me,
          }),
        ]);

        return tmp;
      });

      logEvent('github.link_project', {
        userId: me.id,
        orgId: org.id,
        projectId: body.projectId,
      });

      return res.status(200).send({
        data: { id: source.id },
      });
    }
  );
  done();
};

export default fn;
