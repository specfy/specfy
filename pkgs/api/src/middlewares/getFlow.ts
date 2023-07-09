import type { FastifyRequest } from 'fastify';
import { z } from 'zod';

import { notFound, validationError } from '../common/errors.js';
import { schemaId, schemaOrgId } from '../common/validators/index.js';
import { valPermissions } from '../common/zod.js';
import { prisma } from '../db/index.js';
import type { GetFlow } from '../types/api/index.js';
import type { PreHandler } from '../types/fastify.js';

export function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      flow_id: schemaId,
    })
    .strict()
    .superRefine(valPermissions(req));
}

export const getFlow: PreHandler<
  Pick<GetFlow, 'Params' | 'Querystring'>
> = async (req, res) => {
  const val = QueryVal(req).safeParse({ ...req.params, ...req.query });
  if (!val.success) {
    return validationError(res, val.error);
  }

  const query: GetFlow['QP'] = val.data;
  const flow = await prisma.flows.findFirst({
    where: {
      id: query.flow_id,
      orgId: query.org_id,
    },
  });

  if (!flow) {
    return notFound(res);
  }

  req.flow = flow;
};
