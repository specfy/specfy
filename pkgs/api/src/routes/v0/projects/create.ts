import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import z from 'zod';

import { validationError } from '../../../common/errors';
import { getOrgFromRequest } from '../../../common/perms';
import { schemaProject } from '../../../common/validators';
import { valOrgId } from '../../../common/zod';
import { prisma } from '../../../db';
import { noQuery } from '../../../middlewares/noQuery';
import { createProject } from '../../../models';
import { v1 } from '../../../models/billing';
import type { PostProject } from '../../../types/api';

function ProjectVal(req: FastifyRequest) {
  const obj: Record<keyof PostProject['Body'], any> = {
    name: schemaProject.shape.name,
    slug: schemaProject.shape.slug,
    orgId: valOrgId(req),
    display: schemaProject.shape.display,
  };
  return z
    .object(obj)
    .strict()
    .superRefine(async (val, ctx) => {
      const res = await prisma.projects.findFirst({
        where: { slug: val.slug, orgId: val.orgId },
      });
      if (res) {
        ctx.addIssue({
          path: ['slug'],
          code: z.ZodIssueCode.custom,
          params: { code: 'exists' },
          message: `This slug is already used`,
        });
        return;
      }

      const count = await prisma.projects.count({
        where: {
          orgId: val.orgId,
        },
      });
      const org = getOrgFromRequest(req, val.orgId);
      if (!org) {
        return;
      }

      const max = org.isPersonal ? v1.free.project.max : v1.paid.project.max;
      if (count >= max) {
        ctx.addIssue({
          path: ['name'],
          code: z.ZodIssueCode.custom,
          params: { code: 'max' },
          message:
            "You can't have more projects in your organization, contact us if you need more",
        });
        return;
      }
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
