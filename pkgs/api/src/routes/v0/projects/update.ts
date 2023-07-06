import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { toApiProject } from '../../../common/formatters/project.js';
import { slugify } from '../../../common/string.js';
import { schemaProject } from '../../../common/validators/index.js';
import { prisma } from '../../../db/index.js';
import { getProject } from '../../../middlewares/getProject.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import { createProjectActivity } from '../../../models/index.js';
import type { PutProject } from '../../../types/api/index.js';

function BodyVal() {
  return z
    .object({
      name: schemaProject.shape.name.superRefine(async (val, ctx) => {
        const slug = slugify(val);
        const res = await prisma.projects.findFirst({ where: { slug } });
        if (!res) {
          return;
        }

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          params: { code: 'exists' },
          message: `This slug is already used`,
        });
      }),
      // TODO: allow slug modification
    })
    .strict();
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.put<PutProject>(
    '/',
    { preHandler: [noQuery, getProject] },
    async function (req, res) {
      const val = await BodyVal().safeParseAsync(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const data: PutProject['Body'] = val.data;
      let project = req.project!;

      if (data.name) {
        project = await prisma.$transaction(async (tx) => {
          const tmp = await tx.projects.update({
            data: { name: data.name, slug: slugify(data.name) },
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

      res.status(200).send({
        data: toApiProject(project),
      });
    }
  );

  done();
};

export default fn;
