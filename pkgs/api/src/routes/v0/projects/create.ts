import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import z from 'zod';

import { validationError } from '../../../common/errors';
import { nanoid } from '../../../common/id';
import { schemaProject } from '../../../common/validators';
import { valOrgId } from '../../../common/zod';
import { prisma } from '../../../db';
import { noQuery } from '../../../middlewares/noQuery';
import { createProject } from '../../../models';
import type { ReqPostProject, ResPostProject } from '../../../types/api';

function ProjectVal(req: FastifyRequest) {
  return z
    .object({
      name: schemaProject.shape.name,
      slug: schemaProject.shape.slug.superRefine(async (val, ctx) => {
        const res = await prisma.projects.findFirst({ where: { slug: val } });
        if (!res) {
          return;
        }

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          params: { code: 'exists' },
          message: `This slug is already used`,
        });
      }),
      orgId: valOrgId(req),
      display: schemaProject.shape.display,
    })
    .strict();
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{
    Body: ReqPostProject;
    Reply: ResPostProject;
  }>('/', { preHandler: noQuery }, async function (req, res) {
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
        },
        user: req.user!,
        tx,
      });

      await tx.perms.create({
        data: {
          id: nanoid(),
          orgId: data.orgId,
          projectId: tmp.id,
          userId: req.user!.id,
          role: 'owner',
        },
      });

      return tmp;
    });

    res.status(200).send({
      id: project.id,
      slug: project.slug,
    });
  });

  done();
};

export default fn;
