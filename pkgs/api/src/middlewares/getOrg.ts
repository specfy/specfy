import { schemaOrgId } from '@specfy/core';
import { getOrgFromRequest } from '@specfy/models';
import type { ReqOrgParams } from '@specfy/models';
import type { PreHandler } from '@specfy/models/src/fastify';
import type { FastifyRequest } from 'fastify';
import { z } from 'zod';

import { notFound, validationError } from '../common/errors.js';
import { valPermissions } from '../common/zod.js';

export function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
    })
    .strict()
    .superRefine(valPermissions(req, 'owner'));
}

export const getOrg: PreHandler<{
  Params: ReqOrgParams;
}> = async (req, res) => {
  const val = QueryVal(req).safeParse(req.params);
  if (!val.success) {
    return validationError(res, val.error);
  }

  const params: ReqOrgParams = val.data;
  const permOrg = getOrgFromRequest(req, params.org_id);

  if (!permOrg) {
    return notFound(res);
  }

  req.org = permOrg;
};
