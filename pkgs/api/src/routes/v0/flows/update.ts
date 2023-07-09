import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { prisma } from '../../../db/index.js';
import { getFlow } from '../../../middlewares/getFlow.js';
import { recomputeOrgGraph } from '../../../models/flows/helpers.js';
import { schemaFlowUpdate } from '../../../models/flows/validator.js';
import type { PatchFlow } from '../../../types/api/index.js';

function BodyVal(req: FastifyRequest) {
  const flow = req.flow!;
  return z
    .object({
      updates: schemaFlowUpdate,
    })
    .strict()
    .superRefine((val, ctx) => {
      const edgesId = new Set<string>(flow.flow.edges.map((edge) => edge.id));
      const nodesId = new Set<string>(flow.flow.nodes.map((node) => node.id));

      for (const key of Object.keys(val.updates.edges)) {
        if (!edgesId.has(key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            params: { code: 'unknown' },
            message: 'Edge does not exists',
            path: ['updates', 'edges', key],
          });
        }
      }

      for (const key of Object.keys(val.updates.nodes)) {
        if (!nodesId.has(key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            params: { code: 'unknown' },
            message: 'Node does not exists',
            path: ['updates', 'nodes', key],
          });
        }
      }
    });
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.patch<PatchFlow>(
    '/',
    { preHandler: [getFlow] },
    async function (req, res) {
      const val = await BodyVal(req).safeParseAsync(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const flow = req.flow!;
      const data: PatchFlow['Body'] = val.data;

      await prisma.$transaction(async (tx) => {
        await recomputeOrgGraph({
          orgId: flow.orgId,
          updates: data.updates,
          tx,
        });
      });

      return res.status(200).send({
        data: {
          done: true,
        },
      });
    }
  );
  done();
};

export default fn;
