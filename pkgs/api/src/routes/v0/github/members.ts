import { RequestError } from '@octokit/request-error';
import type { FastifyPluginCallback } from 'fastify';
import { Octokit } from 'octokit';
import { z } from 'zod';

import { notFound, serverError, validationError } from '../../../common/errors';
import { prisma } from '../../../db';
import type {
  ReqGetGithubMembers,
  ResGetGithubMembersSuccess,
} from '../../../types/api';

function QueryVal() {
  return z
    .object({
      org: z.string().max(100).min(2),
    })
    .strict();
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Querystring: ReqGetGithubMembers;
    Reply: ResGetGithubMembersSuccess;
  }>('/', async function (req, res) {
    const val = QueryVal().safeParse(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query = val.data;
    const user = req.user!;

    const accounts = await prisma.accounts.findFirst({
      where: { userId: user.id },
    });

    const octokit = new Octokit({
      auth: accounts!.accessToken,
    });

    try {
      const list = await octokit.rest.orgs.listMembers({
        org: query.org,
      });

      console.log(list);

      res.status(200).send({
        data: list.data.map((u) => {
          return {
            id: u.id,
            name: u.login,
            url: u.url,
            avatarUrl: u.avatar_url,
          };
        }),
      });
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof RequestError) {
        notFound(res);
        return;
      }

      serverError(res);
      return;
    }
  });

  done();
};

export default fn;