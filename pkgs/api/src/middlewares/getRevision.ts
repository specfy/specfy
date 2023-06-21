import type { FastifyRequest } from 'fastify';
import { z } from 'zod';

import { notFound, validationError } from '../common/errors';
import { schemaId } from '../common/validators';
import { valOrgId, valProjectId } from '../common/zod';
import { prisma } from '../db';
import type { GetRevision } from '../types/api';
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
  Querystring: GetRevision['Querystring'];
  Params: GetRevision['Params'];
}> = async (req, res) => {
  const val = QueryVal(req).safeParse({
    ...req.params,
    ...req.query,
  });
  if (!val.success) {
    return validationError(res, val.error);
  }

  const data = val.data;
  const proj = await prisma.revisions.findFirst({
    where: {
      orgId: data.org_id,
      projectId: data.project_id,
      id: data.revision_id,
    },
    include: {
      Project: true,
    },
  });

  if (!proj) {
    return notFound(res);
  }

  req.revision = proj;
};
