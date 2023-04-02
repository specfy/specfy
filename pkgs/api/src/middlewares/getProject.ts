import type { FastifyRequest } from 'fastify';
import { z } from 'zod';

import { notFound, validationError, forbidden } from '../common/errors';
import { schemaSlug } from '../common/validators';
import { valOrgId } from '../common/zod';
import { prisma } from '../db';
import type { ReqProjectParams } from '../types/api';
import type { PreHandler } from '../types/fastify';

export function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: valOrgId(req),
      project_slug: schemaSlug,
    })
    .strict();
}

export const getProject: PreHandler<{
  Params: ReqProjectParams;
}> = async (req, res) => {
  const val = QueryVal(req).safeParse(req.params);
  if (!val.success) {
    return validationError(res, val.error);
  }

  const params = val.data;
  const proj = await prisma.projects.findUnique({
    where: {
      orgId_slug: { orgId: params.org_id, slug: params.project_slug },
    },
  });

  if (!proj) {
    return notFound(res);
  }

  if (!req.perms!.find((perm) => perm.projectId === proj.id)) {
    return forbidden(res);
  }

  req.project = proj;
};
