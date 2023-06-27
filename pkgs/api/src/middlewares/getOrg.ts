import type { FastifyRequest } from 'fastify';
import { z } from 'zod';

import { notFound, validationError } from '../common/errors.js';
import { getOrgFromRequest } from '../common/perms.js';
import { schemaOrgId } from '../common/validators/common.js';
import { valPermissions } from '../common/zod.js';
import type { ReqOrgParams } from '../types/api/index.js';
import type { PreHandler } from '../types/fastify.js';

export function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
    })
    .strict()
    .superRefine(valPermissions(req));
}

export const getOrg: PreHandler<{
  Params: ReqOrgParams;
}> = async (req, res) => {
  const val = QueryVal(req).safeParse(req.params);
  if (!val.success) {
    return validationError(res, val.error);
  }

  const params = val.data;
  const permOrg = getOrgFromRequest(req, params.org_id);

  if (!permOrg) {
    return notFound(res);
  }

  req.org = permOrg;
};
