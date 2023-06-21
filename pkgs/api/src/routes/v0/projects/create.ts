import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import z from 'zod';

import { validationError } from '../../../common/errors';
import { schemaProject } from '../../../common/validators';
import { valOrgId } from '../../../common/zod';
import { prisma } from '../../../db';
import { noQuery } from '../../../middlewares/noQuery';
import { createProject } from '../../../models';
import type { PostProject } from '../../../types/api';

function ProjectVal(req: FastifyRequest) {
  return z
    .object({
      name: schemaProject.shape.name,
      slug: schemaProject.shape.slug,
      orgId: valOrgId(req),
      display: schemaProject.shape.display,
      githubRepositoryId: z.number().int().positive().nullable(),
    })
    .strict()
    .superRefine(async (val, ctx) => {
      const res = await prisma.projects.findFirst({
        where: { slug: val.slug, orgId: val.orgId },
      });
      if (!res) {
        return;
      }

      ctx.addIssue({
        path: ['slug'],
        code: z.ZodIssueCode.custom,
        params: { code: 'exists' },
        message: `This slug is already used`,
      });
    });
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<PostProject>(
    '/',
    { preHandler: noQuery },
    async function (req, res) {
      const val = await ProjectVal(req).safeParseAsync(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const data = val.data;

      const project = await prisma.$transaction(async (tx) => {
        const tmp = await createProject({
          data: {
            orgId: data.orgId,
            name: data.name,
            slug: data.slug,
            description: {
              type: 'doc',
              content: [],
            },
            links: [],
            display: data.display,
            edges: [],
            githubRepositoryId: data.githubRepositoryId,
          },
          user: req.user!,
          tx,
        });

        return tmp;
      });

      res.status(200).send({
        id: project.id,
        slug: project.slug,
      });
    }
  );

  done();
};

export default fn;
