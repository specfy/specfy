import { RequestError } from '@octokit/request-error';
import type { Prisma } from '@prisma/client';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { Octokit } from 'octokit';
import { z } from 'zod';

import {
  notFound,
  serverError,
  validationError,
} from '../../../common/errors.js';
import { getOrgFromRequest } from '../../../common/perms.js';
import { schemaOrgId } from '../../../common/validators/common.js';
import { valPermissions } from '../../../common/zod.js';
import { prisma } from '../../../db/index.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import { createGithubActivity } from '../../../models/index.js';
import { github } from '../../../services/github/index.js';
import type { PostLinkToGithubOrg } from '../../../types/api/index.js';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      orgId: schemaOrgId,
      installationId: z.number().positive().int().nullable(),
    })
    .strict()
    .superRefine(valPermissions(req));
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

      const user = req.user!;
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
