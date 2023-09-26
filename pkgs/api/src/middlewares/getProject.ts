import { schemaId, schemaOrgId } from '@specfy/core';
import { prisma } from '@specfy/db';
import { checkInheritedPermissions } from '@specfy/models';
import { z } from 'zod';

import type {
  GetProject,
  ReqProjectParams,
  ReqProjectQuery,
} from '@specfy/models';
import type { PreHandler } from '@specfy/models/src/fastify';

import { forbidden, notFound, validationError } from '../common/errors.js';
import { valPermissions } from '../common/zod.js';

import type { FastifyRequest } from 'fastify';

export function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      project_id: schemaId,
    })
    .strict()
    .superRefine(valPermissions(req, 'viewer'));
}

export const getProject: PreHandler<{
  Params: ReqProjectParams;
  Querystring: ReqProjectQuery;
}> = async (req, res) => {
  const val = QueryVal(req).safeParse({ ...req.params, ...req.query });
  if (!val.success) {
    return validationError(res, val.error);
  }

  const params: GetProject['QP'] = val.data;
  const proj = await prisma.projects.findFirst({
    where: { id: params.project_id, orgId: params.org_id },
  });

  if (!proj) {
    return notFound(res);
  }

  if (req.method !== 'GET') {
    if (
      !checkInheritedPermissions(req.perms!, 'contributor', proj.orgId, proj.id)
    ) {
      return forbidden(res);
    }
  }

  req.project = proj;
};
