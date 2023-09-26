import { prisma } from '@specfy/db';
import {
  recomputeOrgGraph,
  createProjectActivity,
  toApiProject,
  schemaProject,
} from '@specfy/models';
import { z } from 'zod';

import type { PutProject } from '@specfy/models';

import { validationError } from '../../../common/errors.js';
import { getProject } from '../../../middlewares/getProject.js';

import type { FastifyPluginCallback, FastifyRequest } from 'fastify';

function BodyVal(req: FastifyRequest) {
  return z
    .object({
      name: schemaProject.shape.name,
      slug: schemaProject.shape.slug.superRefine(async (val, ctx) => {
        const res = await prisma.projects.count({
          where: {
            slug: val,
            orgId: req.project!.orgId,
            id: { not: req.project!.id },
          },
        });
        if (!res) {
          return;
        }

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          params: { code: 'exists' },
          message: `This slug is already used`,
        });
      }),
      config: schemaProject.shape.config,
    })
    .strict()
    .partial({ name: true, slug: true, config: true });
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.put<PutProject>(
    '/',
    { preHandler: [getProject] },
    async function (req, res) {
      const val = await BodyVal(req).safeParseAsync(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const data: PutProject['Body'] = val.data;
      let project = req.project!;

      if (data.name && data.slug) {
        project = await prisma.$transaction(async (tx) => {
          const tmp = await tx.projects.update({
            data: { name: data.name!, slug: data.slug! },
            where: { id: project.id },
          });
          await createProjectActivity({
            user: req.me!,
            action: 'Project.updated',
            target: tmp,
            tx,
          });

          await recomputeOrgGraph({ orgId: tmp.orgId, tx });

          return tmp;
        });
      } else if (data.config) {
        project = await prisma.$transaction(async (tx) => {
          const tmp = await tx.projects.update({
            data: { config: data.config! },
            where: { id: project.id },
          });

          return tmp;
        });
      }

      return res.status(200).send({
        data: toApiProject(project),
      });
    }
  );
  done();
};

export default fn;
