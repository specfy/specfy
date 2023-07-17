import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { slugify } from '../../../common/string.js';
import { prisma } from '../../../db/index.js';
import { getProject } from '../../../middlewares/getProject.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import { createProjectActivity } from '../../../models/index.js';
import { toApiProject } from '../../../models/projects/formatter.js';
import { schemaProject } from '../../../models/projects/schema.js';
import type { PutProject } from '../../../types/api/index.js';

function BodyVal(req: FastifyRequest) {
  return z
    .object({
      name: schemaProject.shape.name,
      slug: schemaProject.shape.slug.superRefine(async (val, ctx) => {
        const res = await prisma.projects.count({
          where: { slug: val, orgId: req.project!.orgId },
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
    })
    .strict();
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.put<PutProject>(
    '/',
    { preHandler: [noQuery, getProject] },
    async function (req, res) {
      const val = await BodyVal(req).safeParseAsync(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const data: PutProject['Body'] = val.data;
      let project = req.project!;

      if (data.name) {
        project = await prisma.$transaction(async (tx) => {
          const tmp = await tx.projects.update({
            data: { name: data.name, slug: data.slug },
            where: { id: project.id },
          });
          await createProjectActivity({
            user: req.user!,
            action: 'Project.updated',
            target: tmp,
            tx,
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
