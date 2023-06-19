import { RequestError } from '@octokit/request-error';
import type { Prisma } from '@prisma/client';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { Octokit } from 'octokit';
import { z } from 'zod';

import { notFound, serverError, validationError } from '../../../common/errors';
import { valOrgId } from '../../../common/zod';
import { prisma } from '../../../db';
import { noQuery } from '../../../middlewares/noQuery';
import { github } from '../../../services/github';
import type { PostLinkToGithubOrg } from '../../../types/api';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      orgId: valOrgId(req),
      installationId: z.number().positive().int().nullable(),
    })
    .strict();
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{
    Body: PostLinkToGithubOrg['body'];
    Reply: PostLinkToGithubOrg['res'];
  }>('/', { preHandler: noQuery }, async function (req, res) {
    const val = await QueryVal(req).safeParseAsync(req.body);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const user = req.user!;
    const body = val.data;
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
          notFound(res);
          return;
        }

        serverError(res);
        return;
      }
    }

    const data: Prisma.OrgsUpdateArgs['data'] = {
      githubInstallationId: body.installationId,
    };
    if (body.installationId) {
      const install = await github.octokit.rest.apps.getInstallation({
        installation_id: body.installationId!,
      });
      if (install.data.account?.avatar_url) {
        data.avatarUrl = install.data.account.avatar_url;
      }
    }

    // Set install
    await prisma.orgs.update({
      data,
      where: {
        id: body.orgId,
      },
    });

    res.status(200).send({
      done: true,
    });
  });

  done();
};

export default fn;
