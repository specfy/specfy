import { RequestError } from '@octokit/request-error';
import { sentry } from '@specfy/core';
import { prisma } from '@specfy/db';
import { Octokit } from 'octokit';
import { z } from 'zod';

import type { ListGitHubRepos } from '@specfy/models';

import {
  notFound,
  serverError,
  validationError,
} from '../../../common/errors.js';

import type { FastifyPluginCallback } from 'fastify';

function QueryVal() {
  return z
    .object({
      installation_id: z.coerce.number(),
    })
    .strict()
    .partial();
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<ListGitHubRepos>('/', async function (req, res) {
    const val = QueryVal().safeParse(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query = val.data;
    const user = req.me!;

    let repos: Awaited<
      ReturnType<Octokit['rest']['repos']['listForAuthenticatedUser']>
    >['data'] = [];
    const data: ListGitHubRepos['Success']['data'] = [];
    const accounts = await prisma.accounts.findFirst({
      where: { userId: user.id },
    });

    if (!query.installation_id) {
      // ---- Personal
      const octokit = new Octokit({
        auth: accounts!.accessToken,
      });

      const list = await octokit.rest.repos.listForAuthenticatedUser({
        per_page: 200,
        type: 'owner',
        sort: 'updated',
      });
      repos = list.data;
    } else {
      const octokit = new Octokit({
        auth: accounts!.accessToken,
      });

      try {
        // TODO: paginate
        const list =
          await octokit.rest.apps.listInstallationReposForAuthenticatedUser({
            installation_id: query.installation_id,
            per_page: 500,
          });
        repos = list.data.repositories;
      } catch (e: unknown) {
        if (e instanceof RequestError) {
          console.error(e);
          sentry.captureException(e);
          return notFound(res);
        }

        return serverError(res);
      }
    }

    // Output
    for (const repo of repos) {
      if (repo.fork || repo.is_template) {
        continue;
      }

      data.push({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        url: repo.html_url,
        private: repo.private,
      });
    }
    return res.status(200).send({
      data,
    });
  });
  done();
};

export default fn;
