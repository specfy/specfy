import { prisma } from '@specfy/db';
import type { ListGitHubInstallations } from '@specfy/models';
import type { FastifyPluginCallback } from 'fastify';
import { Octokit } from 'octokit';

import { noQuery } from '../../../middlewares/noQuery.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<ListGitHubInstallations>(
    '/',
    { preHandler: [noQuery] },
    async function (req, res) {
      const user = req.me!;

      const accounts = await prisma.accounts.findFirst({
        where: { userId: user.id },
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
