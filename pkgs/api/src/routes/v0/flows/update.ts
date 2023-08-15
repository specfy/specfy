import { prisma } from '@specfy/db';
import {
  recomputeOrgGraph,
  schemaFlowUpdate,
  checkInheritedPermissions,
} from '@specfy/models';
import type { PatchFlow } from '@specfy/models';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { forbidden, validationError } from '../../../common/errors.js';
import { getFlow } from '../../../middlewares/getFlow.js';

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

      const data: PatchFlow['Body'] = val.data;
      if (
        !checkInheritedPermissions(req.perms!, 'contributor', req.query.org_id)
      ) {
        return forbidden(res);
      }

      const flow = req.flow!;

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
