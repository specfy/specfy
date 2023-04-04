import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { toApiProject } from '../../../common/formatters/project';
import { slugify } from '../../../common/string';
import { schemaProject } from '../../../common/validators';
import { prisma } from '../../../db';
import { getProject } from '../../../middlewares/getProject';
import { noQuery } from '../../../middlewares/noQuery';
import { createProjectActivity } from '../../../models/project';
import type {
  ReqProjectParams,
  ReqPutProject,
  ResPutProject,
} from '../../../types/api';

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
  fastify.put<{
    Params: ReqProjectParams;
    Body: ReqPutProject;
    Reply: ResPutProject;
  }>('/', { preHandler: [noQuery, getProject] }, async function (req, res) {
    const val = await BodyVal().safeParseAsync(req.body);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const data = val.data;
    let project = req.project!;

    if (data.name) {
      project = await prisma.$transaction(async (tx) => {
        const tmp = await tx.projects.update({
          data: { name: data.name, slug: slugify(data.name) },
          where: { id: project.id },
        });
        await createProjectActivity(req.user!, 'Project.updated', tmp, tx);

        return tmp;
      });
    }

    res.status(200).send({
      data: toApiProject(project),
    });
  });

  done();
};

export default fn;
