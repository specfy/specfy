import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import z from 'zod';

import { validationError } from '../../../common/errors.js';
import { getOrgFromRequest } from '../../../common/perms.js';
import {
  schemaOrgId,
  schemaProject,
} from '../../../common/validators/index.js';
import { valPermissions } from '../../../common/zod.js';
import { prisma } from '../../../db/index.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import { v1, createProject } from '../../../models/index.js';
import { recomputeOrgGraph } from '../../../models/revisions/helpers.js';
import type { PostProject } from '../../../types/api/index.js';

function ProjectVal(req: FastifyRequest) {
  return z
    .object({
      name: schemaProject.shape.name,
      slug: schemaProject.shape.slug,
      orgId: schemaOrgId,
    })
    .strict()
    .superRefine(valPermissions(req))
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

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post<PostProject>(
    '/',
    { preHandler: noQuery },
    async function (req, res) {
      const val = await ProjectVal(req).safeParseAsync(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const data: PostProject['Body'] = val.data;

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
          },
          user: req.user!,
          tx,
        });

        await recomputeOrgGraph({ orgId: data.orgId, tx });

        return tmp;
      });

      return res.status(200).send({
        id: project.id,
        slug: project.slug,
      });
    }
  );
  done();
};

export default fn;
