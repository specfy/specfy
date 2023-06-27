import type { FastifyRequest } from 'fastify';
import { z } from 'zod';

import { notFound, validationError } from '../common/errors.js';
import { schemaId, schemaOrgId } from '../common/validators/index.js';
import { valPermissions } from '../common/zod.js';
import { prisma } from '../db/index.js';
import type { GetRevision } from '../types/api/index.js';
import type { PreHandler } from '../types/fastify.js';

export function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      project_id: schemaId,
      revision_id: schemaId,
    })
    .strict()
    .superRefine(valPermissions(req));
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
