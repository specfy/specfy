import { envs, schemaId, schemaOrgId } from '@specfy/core';
import { prisma } from '@specfy/db';
import type { PostAiOperation } from '@specfy/models';
import {
  aiCompletion,
  aiPromptProjectDescription,
  aiPromptProjectOnboarding,
  aiPromptRewrite,
  aiStream,
} from '@specfy/models';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import {
  notFound,
  serverError,
  validationError,
} from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';
import { noQuery } from '../../../middlewares/noQuery.js';

function BodyVal(req: FastifyRequest) {
  return z
    .object({
      orgId: schemaOrgId,
      projectId: schemaId.optional(),
      operation: z.discriminatedUnion('type', [
        z.object({
          type: z.literal('rewrite'),
          text: z.string().min(1).max(1000),
        }),
        z.object({
          type: z.literal('project.description'),
        }),
        z.object({
          type: z.literal('project.onboarding'),
        }),
      ]),
    })
    .strict()
    .superRefine(valPermissions(req, 'viewer'))
    .superRefine((val, ctx) => {
      if (!val.projectId && val.operation.type === 'project.description') {
        ctx.addIssue({
          path: ['projectId'],
          code: z.ZodIssueCode.custom,
          message: "projectId is required for operation 'project.description'",
        });
      }
    });

  // TODO: implement usage
  // .superRefine(async (val, ctx) => {
  //   const org = getOrgFromRequest(req, val.orgId);
  //   if (!org) {
  //     // Ts Pleasing
  //     return;
  //   }

  //   const usage = await getUsage(org);
  //   if (usage.projects.pct >= 100) {
  //     ctx.addIssue({
  //       path: ['name'],
  //       code: z.ZodIssueCode.custom,
  //       params: { code: 'max' },
  //       message:
  //         "You can't have more projects in your organization, upgrade your plan or contact us if you need more",
  //     });
  //     return;
  //   }
  // });
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post<PostAiOperation>(
    '/',
    {
      preHandler: [noQuery],
      config: {
        rateLimit: { max: 50 },
      },
    },
    async function (req, res) {
      const val = await BodyVal(req).safeParseAsync(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      if (!envs.OPENAI_KEY) {
        return serverError(res);
      }

      // TODO: cache those DB queries
      // TODO: cache those AI results
      const data: PostAiOperation['Body'] = val.data;
      const op = data.operation;

      if (op.type === 'rewrite') {
        const rewrite = await aiCompletion({
          orgId: data.orgId,
          messages: aiPromptRewrite({ text: op.text }),
        });
        await aiStream(res, rewrite);
        return;
      }

      if (op.type === 'project.description') {
        const project = await prisma.projects.findUnique({
          where: { id: data.projectId! },
          select: { name: true },
        });
        const components = await prisma.components.findMany({
          where: { orgId: data.orgId, projectId: data.projectId! },
          select: { name: true, type: true, techId: true, slug: true },
        });
        if (!project) {
          return serverError(res);
        }

        const rewrite = await aiCompletion({
          orgId: data.orgId,
          messages: aiPromptProjectDescription({ project, components }),
        });
        await aiStream(res, rewrite);
        return;
      }

      if (op.type === 'project.onboarding') {
        const project = await prisma.projects.findUnique({
          where: { id: data.projectId! },
          select: {
            name: true,
            description: true,
            slug: true,
            orgId: true,
            links: true,
          },
        });
        const components = await prisma.components.findMany({
          where: { orgId: data.orgId, projectId: data.projectId! },
          select: { name: true, type: true, techId: true, slug: true },
        });
        const documents = await prisma.documents.findMany({
          where: { orgId: data.orgId, projectId: data.projectId! },
          select: { name: true, slug: true },
        });
        if (!project) {
          return serverError(res);
        }

        const rewrite = await aiCompletion({
          orgId: data.orgId,
          messages: aiPromptProjectOnboarding({
            project,
            components,
            documents,
          }),
        });
        await aiStream(res, rewrite);
        return;
      }

      return notFound(res);
    }
  );
  done();
};

export default fn;
