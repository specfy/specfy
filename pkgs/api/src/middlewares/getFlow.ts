import { schemaId, schemaOrgId } from '@specfy/core';
import { prisma } from '@specfy/db';
import { checkInheritedPermissions } from '@specfy/models';
import type { GetFlow } from '@specfy/models';
import type { PreHandler } from '@specfy/models/src/fastify.js';
import type { FastifyRequest } from 'fastify';
import { z } from 'zod';

import { forbidden, notFound, validationError } from '../common/errors.js';
import { valPermissions } from '../common/zod.js';

export function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      flow_id: schemaId,
    })
    .strict()
    .superRefine(valPermissions(req, 'viewer'));
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

  if (req.method !== 'GET') {
    if (!checkInheritedPermissions(req.perms!, 'contributor', flow.orgId)) {
      return forbidden(res);
    }
  }

  req.flow = flow;
};
