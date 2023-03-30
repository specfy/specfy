import type { FastifyRequest } from 'fastify';
import { z } from 'zod';

import { notFound, validationError } from '../common/errors';
import { schemaId } from '../common/validators';
import { valOrgId, valProjectId } from '../common/zod';
import { Revision } from '../models';
import type { ReqGetRevision, ReqRevisionParams } from '../types/api';
import type { PreHandler } from '../types/fastify';

export function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: valOrgId(req),
      project_id: valProjectId(req),
      revision_id: schemaId,
    })
    .strict();
}

export const getRevision: PreHandler<{
  Querystring: ReqGetRevision;
  Params: ReqRevisionParams;
}> = async (req, res) => {
  const val = QueryVal(req).safeParse({
    ...req.params,
    ...req.query,
  });
  if (!val.success) {
    return validationError(res, val.error);
  }

  const data = val.data;
  const proj = await Revision.findOne({
    where: {
      orgId: data.org_id,
      projectId: data.project_id,
      id: data.revision_id,
    },
  });

  if (!proj) {
    return notFound(res);
  }

  req.revision = proj;
};
