import { prisma } from '@specfy/db';
import type { FastifyRequest } from 'fastify';
import { z } from 'zod';

import { forbidden, notFound, validationError } from '../common/errors.js';
import { schemaId, schemaOrgId } from '../common/validators/index.js';
import { valPermissions } from '../common/zod.js';
import { checkInheritedPermissions } from '../models/perms/helpers.js';
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
    .superRefine(valPermissions(req, 'viewer'));
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

  const data: GetRevision['QP'] = val.data;
  const proj = await prisma.revisions.findFirst({
    where: {
      orgId: data.org_id,
      projectId: data.project_id,
      id: data.revision_id,
    },
    include: {
      Project: true,
      TypeHasUsers: { include: { User: true } },
    },
  });

  if (!proj) {
    return notFound(res);
  }

  if (req.method !== 'GET') {
    if (
      !checkInheritedPermissions(
        req.perms!,
        'contributor',
        data.org_id,
        data.project_id
      )
    ) {
      return forbidden(res);
    }
  }

  req.revision = proj;
};
