import type { FastifyRequest } from 'fastify';
import { z } from 'zod';

import { notFound, validationError, forbidden } from '../common/errors.js';
import { checkInheritedPermissions } from '../common/perms.js';
import { schemaOrgId, schemaSlug } from '../common/validators/index.js';
import { valPermissions } from '../common/zod.js';
import { prisma } from '../db/index.js';
import type { ReqProjectParams } from '../types/api/index.js';
import type { PreHandler } from '../types/fastify.js';

export function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      project_slug: schemaSlug,
    })
    .strict()
    .superRefine(valPermissions(req));
}

export const getProject: PreHandler<{
  Params: ReqProjectParams;
}> = async (req, res) => {
  const val = QueryVal(req).safeParse(req.params);
  if (!val.success) {
    return validationError(res, val.error);
  }

  const params: ReqProjectParams = val.data;
  const proj = await prisma.projects.findUnique({
    where: {
      orgId_slug: { orgId: params.org_id, slug: params.project_slug },
    },
  });

  if (!proj) {
    return notFound(res);
  }

  if (!checkInheritedPermissions(req, params.org_id, proj.id)) {
    return forbidden(res);
  }

  req.project = proj;
};
