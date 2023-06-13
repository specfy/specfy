import { createAppAuth } from '@octokit/auth-app';
import type { FastifyPluginCallback } from 'fastify';
import { Octokit } from 'octokit';

import { env } from '../../../common/env';
import { noQuery } from '../../../middlewares/noQuery';
import type { ResGetGithubInstallationsSuccess } from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{ Reply: ResGetGithubInstallationsSuccess }>(
    '/',
    { preHandler: [noQuery] },
    async function (_req, res) {
      const octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId: env('GITHUB_CLIENT_APPID')!,
          privateKey: env('GITHUB_CLIENT_PKEY')!,
        },
      });
      const list = await octokit.rest.apps.listInstallations();
      console.log(JSON.stringify(list.data));

      const data: ResGetGithubInstallationsSuccess['data'] = [];
      for (const inst of list.data) {
        if (!inst.account) {
          continue;
        }

        data.push({
          id: inst.id,
          name: inst.account.login!,
          avatar: inst.account.avatar_url!,
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
