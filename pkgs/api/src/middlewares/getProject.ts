import { schemaOrgId, schemaSlug } from '@specfy/core';
import { prisma } from '@specfy/db';
import { checkInheritedPermissions } from '@specfy/models';
import type { ReqProjectParams } from '@specfy/models';
import type { FastifyRequest } from 'fastify';
import { z } from 'zod';

import { forbidden, notFound, validationError } from '../common/errors.js';
import { valPermissions } from '../common/zod.js';
import type { PreHandler } from '../types/fastify.js';

export function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      project_slug: schemaSlug,
    })
    .strict()
    .superRefine(valPermissions(req, 'viewer'));
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

  if (req.method !== 'GET') {
    if (
      !checkInheritedPermissions(req.perms!, 'contributor', proj.orgId, proj.id)
    ) {
      return forbidden(res);
    }
  }

  req.project = proj;
};
