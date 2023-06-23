import { RequestError } from '@octokit/request-error';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { Octokit } from 'octokit';
import { z } from 'zod';

import { notFound, serverError, validationError } from '../../../common/errors';
import { getOrgFromRequest } from '../../../common/perms';
import { valOrgId, valProjectId } from '../../../common/zod';
import { prisma } from '../../../db';
import { noQuery } from '../../../middlewares/noQuery';
import { createGithubActivity } from '../../../models/github';
import type { ApiProject, PostLinkToGithubProject } from '../../../types/api';

const repoRegex = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
function QueryVal(req: FastifyRequest) {
  const obj: Record<keyof PostLinkToGithubProject['Body'], any> = {
    orgId: valOrgId(req),
    projectId: valProjectId(req),
    repository: z.string().max(250).regex(repoRegex),
  };
  return z.object(obj).strict();
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<PostLinkToGithubProject>(
    '/',
    { preHandler: noQuery },
    async function (req, res) {
      const val = await QueryVal(req).safeParseAsync(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const user = req.user!;
      const body = val.data;
      const org = getOrgFromRequest(req, body.orgId)!;
      const accounts = await prisma.accounts.findFirst({
        where: { userId: user.id },
      });

      if (body.repository) {
        try {
          const octokit = new Octokit({
            auth: accounts!.accessToken,
          });
          const [owner, repo] = body.repository.split('/');
          // Verify that the installation is accessible to the user
          // TODO: find a proper way to do this
          await octokit.rest.repos.get({
            owner,
            repo,
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

      await prisma.$transaction(async (tx) => {
        const proj = await tx.projects.findUnique({
          where: {
            id: body.projectId,
          },
        });
        if (!proj) {
          throw new Error('cant find project');
        }

        let links = proj.links as unknown as ApiProject['links'];
        if (body.repository) {
          links.push({
            title: 'Github',
            url: `https://github.com/${body.repository}`,
          });
        } else {
          links = links.filter((link) => link.title === 'Github');
        }

        await tx.projects.update({
          data: {
            links: links as any,
            githubRepository: body.repository,
          },
          where: {
            id: body.projectId,
          },
        });

        if (body.repository !== proj.githubRepository) {
          await createGithubActivity({
            action: !body.repository ? 'Github.unlinked' : 'Github.linked',
            org,
            project: proj,
            tx,
            user,
          });
        }
      });

      res.status(200).send({
        done: true,
      });
    }
  );

  done();
};

export default fn;
