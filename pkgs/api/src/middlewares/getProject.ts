import { z } from 'zod';

import { notFound, validationError, forbidden } from '../common/errors';
import { valOrgId } from '../common/zod';
import type { Perm } from '../models';
import { Project } from '../models/project';
import type { ReqProjectParams } from '../types/api';
import type { PreHandler } from '../types/fastify';

declare module 'fastify' {
  interface FastifyRequest {
    project?: Project;
  }
}

export function valQueryProject(perms: Perm[]) {
  return z
    .object({
      org_id: valOrgId(perms),
      project_slug: z.string().min(2).max(36),
    })
    .strict();
}

export const getProject: PreHandler<{
  Params: ReqProjectParams;
}> = async (req, res) => {
  const val = valQueryProject(req.perms!).safeParse(req.params);
  if (!val.success) {
    return validationError(res, val.error);
  }

  const params = val.data;
  const proj = await Project.findOne({
    where: {
      orgId: params.org_id,
      slug: params.project_slug,
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
