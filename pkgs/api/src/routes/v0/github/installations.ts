import type { FastifyPluginCallback } from 'fastify';
import { Octokit } from 'octokit';

import { prisma } from '../../../db';
import { noQuery } from '../../../middlewares/noQuery';
import type { ResGetGithubInstallationsSuccess } from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{ Reply: ResGetGithubInstallationsSuccess }>(
    '/',
    { preHandler: [noQuery] },
    async function (req, res) {
      const user = req.user!;

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

      const data: ResGetGithubInstallationsSuccess['data'] = [];
      for (const inst of list.data.installations) {
        if (!inst.account) {
          continue;
        }

        data.push({
          id: inst.id,
          name: inst.account.login!,
          avatarUrl: inst.account.avatar_url!,
          url: inst.account.html_url!,
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
