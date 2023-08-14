import { RequestError } from '@octokit/request-error';
import { schemaOrgId } from '@specfy/core';
import type { Prisma } from '@specfy/db';
import { prisma } from '@specfy/db';
import { github } from '@specfy/github';
import { createGithubActivity, getOrgFromRequest } from '@specfy/models';
import type { PostLinkToGithubOrg } from '@specfy/models';
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

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      orgId: schemaOrgId,
      installationId: z.number().positive().int().nullable(),
    })
    .strict()
    .superRefine(valPermissions(req, 'owner'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post<PostLinkToGithubOrg>(
    '/',
    { preHandler: noQuery },
    async function (req, res) {
      const val = await QueryVal(req).safeParseAsync(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const user = req.me!;
      const body: PostLinkToGithubOrg['Body'] = val.data;
      const org = getOrgFromRequest(req, body.orgId)!;
      const accounts = await prisma.accounts.findFirst({
        where: { userId: user.id },
      });

      if (body.installationId) {
        try {
          const octokit = new Octokit({
            auth: accounts!.accessToken,
          });
          // Verify that the installation is accessible to the user
          // TODO: find a proper way to do this
          await octokit.rest.apps.listInstallationReposForAuthenticatedUser({
            installation_id: body.installationId,
            per_page: 1,
          });
        } catch (e: unknown) {
          if (e instanceof RequestError) {
            console.error(e);
            return notFound(res);
          }

          return serverError(res);
        }
      }

      const data: Prisma.OrgsUpdateArgs['data'] = {
        githubInstallationId: body.installationId,
      };
      if (body.installationId) {
        const install = await github.octokit.rest.apps.getInstallation({
          installation_id: body.installationId,
        });
        if (install.data.account?.avatar_url) {
          data.avatarUrl = install.data.account.avatar_url;
        }
      }

      // Set install
      await prisma.$transaction(async (tx) => {
        await prisma.orgs.update({
          data,
          where: {
            id: body.orgId,
          },
        });
        if (body.installationId !== org.githubInstallationId) {
          await createGithubActivity({
            action: !body.installationId ? 'Github.unlinked' : 'Github.linked',
            org,
            tx,
            user,
          });
        }
      });

      return res.status(200).send({
        done: true,
      });
    }
  );
  done();
};

export default fn;
