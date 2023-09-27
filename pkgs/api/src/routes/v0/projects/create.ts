import { nanoid, slugify, schemaOrgId, logEvent } from '@specfy/core';
import { prisma } from '@specfy/db';
import {
  getUsage,
  recomputeOrgGraph,
  createProject,
  getOrgFromRequest,
  forbiddenProjectSlug,
  schemaProject,
} from '@specfy/models';
import z from 'zod';

import type { PostProject } from '@specfy/models';

import { validationError } from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';
import { noQuery } from '../../../middlewares/noQuery.js';

import type { FastifyPluginCallback, FastifyRequest } from 'fastify';

function ProjectVal(req: FastifyRequest) {
  return z
    .object({
      name: schemaProject.shape.name,
      orgId: schemaOrgId,
    })
    .strict()
    .superRefine(valPermissions(req, 'contributor'))
    .superRefine(async (val, ctx) => {
      const org = getOrgFromRequest(req, val.orgId);
      if (!org) {
        // Ts Pleasing
        return;
      }

      const usage = await getUsage(org);
      if (usage.projects.pct >= 100) {
        ctx.addIssue({
          path: ['name'],
          code: z.ZodIssueCode.custom,
          params: { code: 'max' },
          message:
            "You can't have more projects in your organization, upgrade your plan or contact us if you need more",
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

      const me = req.me!;
      const data: PostProject['Body'] = val.data;
      let slug = slugify(data.name);

      const project = await prisma.$transaction(async (tx) => {
        const count = await tx.projects.count({
          where: { slug, orgId: data.orgId },
        });
        if (count > 0 || forbiddenProjectSlug.includes(slug)) {
          slug = `${slug}-${nanoid().substring(0, 4)}`.toLocaleLowerCase();
        }

        const tmp = await createProject({
          data: {
            orgId: data.orgId,
            name: data.name,
            slug,
            description: {
              type: 'doc',
              content: [],
            },
            links: [],
            config: {} as any,
          },
          user: req.me!,
          tx,
        });

        await recomputeOrgGraph({ orgId: data.orgId, tx });

        return tmp;
      });

      logEvent('projects.created', {
        userId: me.id,
        orgId: project.orgId,
        projectId: project.id,
      });

      return res.status(200).send({
        data: { id: project.id, slug: project.slug },
      });
    }
  );
  done();
};

export default fn;
