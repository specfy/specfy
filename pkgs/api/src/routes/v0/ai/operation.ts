import { envs, schemaOrgId } from '@specfy/core';
import type { PostAiOperation } from '@specfy/models';
import { aiRewrite } from '@specfy/models';
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
      type: z.enum(['rewrite']),
      text: z.string().min(1).max(1000),
    })
    .strict()
    .superRefine(valPermissions(req, 'viewer'));
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

      const data = val.data;

      if (data.type === 'rewrite') {
        const rewrite = await aiRewrite(data.text);
        return res.status(200).send({ data: { text: rewrite.content } });
      }

      return notFound(res);
    }
  );
  done();
};

export default fn;
