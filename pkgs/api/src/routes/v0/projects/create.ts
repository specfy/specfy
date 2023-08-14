import { nanoid, slugify } from '@specfy/core';
import { schemaOrgId } from '@specfy/core/src/validators/index.js';
import { prisma } from '@specfy/db';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import z from 'zod';

import { validationError } from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import { getUsage } from '../../../models/billing/model.js';
import { recomputeOrgGraph } from '../../../models/flows/helpers.rebuild.js';
import { createProject, getDefaultConfig } from '../../../models/index.js';
import { getOrgFromRequest } from '../../../models/perms/helpers.js';
import { forbiddenProjectSlug } from '../../../models/projects/constants.js';
import { schemaProject } from '../../../models/projects/schema.js';
import type { DBProject } from '../../../models/projects/types.js';
import type { PostProject } from '../../../types/api/index.js';

function ProjectVal(req: FastifyRequest) {
  return z
    .object({
      name: schemaProject.shape.name,
      orgId: schemaOrgId,
      config: schemaProject.shape.config.partial({
        branch: true,
        documentation: true,
        stack: true,
      }),
    })
    .strict()
    .partial({ config: true })
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

      const data: PostProject['Body'] = val.data;
      let slug = slugify(data.name);

      const def = getDefaultConfig();
      const config: DBProject['config'] = {
        branch: data.config?.branch || def.branch,
        documentation: {
          ...def.documentation,
          ...data.config?.documentation,
        },
        stack: {
          ...def.stack,
          ...data.config?.stack,
        },
      };

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
            config,
          },
          user: req.me!,
          tx,
        });

        await recomputeOrgGraph({ orgId: data.orgId, tx });

        return tmp;
      });

      return res.status(200).send({
        data: { id: project.id, slug: project.slug },
      });
    }
  );
  done();
};

export default fn;
