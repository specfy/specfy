import type { FastifyRequest } from 'fastify';
import { z } from 'zod';

import { notFound, validationError } from '../common/errors.js';
import { valOrgId } from '../common/zod.js';
import type { ReqOrgParams } from '../types/api/index.js';
import type { PreHandler } from '../types/fastify.js';

export function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: valOrgId(req),
    })
    .strict();
}

export const getOrg: PreHandler<{
  Params: ReqOrgParams;
}> = async (req, res) => {
  const val = QueryVal(req).safeParse(req.params);
  if (!val.success) {
    return validationError(res, val.error);
  }

  const params = val.data;
  const permOrg = req.perms?.find(
    (perm) => !perm.projectId && perm.Org.id === params.org_id
  );

  if (!permOrg) {
    return notFound(res);
  }

  req.org = permOrg.Org;
};
