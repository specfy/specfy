import { RequestError } from '@octokit/request-error';
import { logEvent, schemaId, schemaOrgId } from '@specfy/core';
import { prisma } from '@specfy/db';
import {
  createGithubActivity,
  createJobDeploy,
  getOrgFromRequest,
} from '@specfy/models';
import type { PostLinkToGithubProject } from '@specfy/models';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { Octokit } from 'octokit';
import { z } from 'zod';

import {
  notFound,
  serverError,
  validationError,
} from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';
import { noQuery } from '../../../middlewares/noQuery.js';

const repoRegex = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
function QueryVal(req: FastifyRequest) {
  return z
    .object({
      orgId: schemaOrgId,
      projectId: schemaId,
      repository: z.string().max(250).regex(repoRegex).nullable(),
    })
    .strict()
    .superRefine(valPermissions(req, 'owner'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post<PostLinkToGithubProject>(
    '/',
    { preHandler: noQuery },
    async function (req, res) {
      const val = await QueryVal(req).safeParseAsync(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const me = req.me!;
      const body = val.data;
      const org = getOrgFromRequest(req, body.orgId)!;
      const accounts = await prisma.accounts.findFirst({
        where: { userId: me.id },
      });

      if (body.repository) {
        try {
          const octokit = new Octokit({
            auth: accounts!.accessToken,
          });
          const [owner, repo] = body.repository.split('/');
          // Verify that the installation is accessible to the user
          // TODO: find a proper way to do this
          await octokit.rest.repos.get({
            owner,
            repo,
          });
        } catch (e: unknown) {
          if (e instanceof RequestError) {
            console.error(e);
            return notFound(res);
          }

          return serverError(res);
        }
      }

      await prisma.$transaction(async (tx) => {
        const proj = await tx.projects.findUnique({
          where: {
            id: body.projectId,
          },
        });
        if (!proj) {
          throw new Error('cant find project');
        }

        let links = proj.links;
        if (body.repository) {
          links.push({
            title: 'Github',
            url: `https://github.com/${body.repository}`,
          });
        } else {
          links = links.filter((link) => link.title === 'Github');
        }

        await tx.projects.update({
          data: {
            links,
            githubRepository: body.repository,
          },
          where: {
            id: body.projectId,
          },
        });

        if (body.repository) {
          await createJobDeploy({
            orgId: body.orgId,
            projectId: body.projectId,
            userId: me.id,
            config: {
              url: body.repository,
              autoLayout: true,
            },
            tx,
          });
        }
        if (body.repository !== proj.githubRepository) {
          await createGithubActivity({
            action: !body.repository ? 'Github.unlinked' : 'Github.linked',
            org,
            project: proj,
            tx,
            user: me,
          });
        }
      });

      logEvent(
        body.repository ? 'github.link_project' : 'github.unlink_project',
        {
          userId: me.id,
          orgId: org.id,
          projectId: body.projectId,
        }
      );

      return res.status(200).send({
        done: true,
      });
    }
  );
  done();
};

export default fn;
