import { createAppAuth } from '@octokit/auth-app';
import { RequestError } from '@octokit/request-error';
import type { FastifyPluginCallback } from 'fastify';
import { Octokit } from 'octokit';
import { z } from 'zod';

import { env } from '../../../common/env';
import { notFound, serverError, validationError } from '../../../common/errors';
import { prisma } from '../../../db';
import type { ResGetGithubReposSuccess } from '../../../types/api';

function QueryVal() {
  return z
    .object({
      installation_id: z.coerce.number(),
    })
    .strict()
    .partial();
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{ Reply: ResGetGithubReposSuccess }>(
    '/',
    async function (req, res) {
      const val = QueryVal().safeParse(req.query);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const query = val.data;
      const user = req.user!;

      let repos: Awaited<
        ReturnType<Octokit['rest']['repos']['listForAuthenticatedUser']>
      >['data'] = [];
      const data: ResGetGithubReposSuccess['data'] = [];
      const accounts = await prisma.accounts.findFirst({
        where: { userId: user.id },
      });

      if (!query.installation_id) {
        // ---- Personal
        const octokit = new Octokit({
          auth: accounts!.accessToken,
        });

        const list = await octokit.rest.repos.listForAuthenticatedUser({
          per_page: 50,
          type: 'owner',
          sort: 'updated',
        });
        repos = list.data;
      } else {
        // ----- App repos
        try {
          // Check that install id is correct
          const octokit = new Octokit({
            authStrategy: createAppAuth,
            auth: {
              appId: env('GITHUB_CLIENT_APPID')!,
              privateKey: env('GITHUB_CLIENT_PKEY'),
            },
          });
          await octokit.rest.apps.getInstallation({
            installation_id: query.installation_id,
          });
        } catch (e: unknown) {
          if (e instanceof RequestError) {
            notFound(res);
            return;
          }

          serverError(res);
          return;
        }

        // List repos
        const octokit = new Octokit({
          authStrategy: createAppAuth,
          auth: {
            appId: env('GITHUB_CLIENT_APPID')!,
            privateKey: env('GITHUB_CLIENT_PKEY'),
            installationId: query.installation_id,
          },
        });
        const list = await octokit.rest.apps.listReposAccessibleToInstallation({
          per_page: 50,
        });
        repos = list.data.repositories;
      }

      // Output
      for (const repo of repos) {
        if (repo.fork || repo.is_template) {
          continue;
        }

        data.push({
          id: repo.id,
          name: repo.name,
          url: repo.html_url,
          private: repo.private,
        });
      }
      res.status(200).send({
        data,
      });
    }
  );

  done();
};

export default fn;
