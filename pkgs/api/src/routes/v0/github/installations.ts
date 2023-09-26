import { prisma } from '@specfy/db';
import { Octokit } from 'octokit';

import type { ListGitHubInstallations } from '@specfy/models';

import { noQuery } from '../../../middlewares/noQuery.js';

import type { FastifyPluginCallback } from 'fastify';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<ListGitHubInstallations>(
    '/',
    { preHandler: [noQuery] },
    async function (req, res) {
      const me = req.me!;

      const accounts = await prisma.accounts.findFirst({
        where: { userId: me.id },
      });
      const octokit = new Octokit({
        auth: accounts!.accessToken,
      });
      const list =
        await octokit.rest.apps.listInstallationsForAuthenticatedUser({
          per_page: 50,
        });

      const data: ListGitHubInstallations['Success']['data'] = [];
      for (const inst of list.data.installations) {
        if (!inst.account) {
          continue;
        }

        data.push({
          id: inst.id,
          name:
            'login' in inst.account ? inst.account.login : inst.account.name,
          avatarUrl: inst.account.avatar_url,
          url: inst.account.html_url,
        });
      }

      return res.status(200).send({
        data,
      });
    }
  );
  done();
};

export default fn;
