import { envs, schemaId, schemaOrgId } from '@specfy/core';
import { prisma } from '@specfy/db';
import type { PostAiOperation } from '@specfy/models';
import {
  aiCompletion,
  aiPromptProjectDescription,
  aiPromptRewrite,
} from '@specfy/models';
import { aiStream } from '@specfy/models/src/ai/openai.js';
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
          type: z.literal('projectDescription'),
        }),
      ]),
    })
    .strict()
    .superRefine(valPermissions(req, 'viewer'))
    .superRefine((val, ctx) => {
      if (!val.projectId && val.operation.type === 'projectDescription') {
        ctx.addIssue({
          path: ['projectId'],
          code: z.ZodIssueCode.custom,
          message: "projectId is required for operation 'projectDescription'",
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

      if (op.type === 'projectDescription') {
        const project = await prisma.projects.findUnique({
          where: { id: data.projectId! },
          select: { name: true },
        });
        const components = await prisma.components.findMany({
          where: { orgId: data.orgId, projectId: data.projectId! },
          select: { name: true, type: true, techId: true },
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

      return notFound(res);
    }
  );
  done();
};

export default fn;
