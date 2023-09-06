import { schemaOrgId, schemaId } from '@specfy/core';
import { prisma } from '@specfy/db';
import { createJobDeploy, toApiJob } from '@specfy/models';
import type { PostJob } from '@specfy/models';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import z from 'zod';

import { validationError } from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';
import { noQuery } from '../../../middlewares/noQuery.js';

function ProjectVal(req: FastifyRequest) {
  return z
    .object({
      orgId: schemaOrgId,
      projectId: schemaId,
      type: z.enum(['deploy']),
    })
    .strict()
    .superRefine(valPermissions(req, 'contributor'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post<PostJob>(
    '/',
    { preHandler: noQuery },
    async function (req, res) {
      const val = await ProjectVal(req).safeParseAsync(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const data: PostJob['Body'] = val.data;
      const me = req.me!;

      const job = await prisma.$transaction(async (tx) => {
        const proj = await tx.projects.findUnique({
          where: { id: data.projectId },
        });

        if (!proj) {
          return 'no_project';
        }

        if (data.type === 'deploy') {
          if (!proj.githubRepository) {
            return 'no_project_repository';
          }

          return await createJobDeploy({
            orgId: data.orgId,
            projectId: data.projectId,
            userId: me.id,
            config: {
              url: proj.githubRepository,
              project: proj.config,
            },
            tx,
          });
        }

        return 'server_error';
      });

      if (typeof job === 'string') {
        return res.status(400).send({
          error: {
            code: 'failed_to_create_job',
            reason: job,
          },
        });
      }

      return res.status(200).send({
        data: toApiJob({ ...job, User: me }),
      });
    }
  );
  done();
};

export default fn;
