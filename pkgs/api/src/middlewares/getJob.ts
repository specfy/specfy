import { prisma } from '@specfy/db';
import type { FastifyRequest } from 'fastify';
import { z } from 'zod';

import { notFound, validationError } from '../common/errors.js';
import { schemaId, schemaOrgId } from '../common/validators/index.js';
import { valPermissions } from '../common/zod.js';
import type { GetJob } from '../types/api/index.js';
import type { PreHandler } from '../types/fastify.js';

export function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      project_id: schemaId,
      job_id: schemaId,
    })
    .strict()
    .superRefine(valPermissions(req, 'viewer'));
}

export const getJob: PreHandler<{
  Querystring: GetJob['Querystring'];
  Params: GetJob['Params'];
}> = async (req, res) => {
  const val = QueryVal(req).safeParse({
    ...req.params,
    ...req.query,
  });
  if (!val.success) {
    return validationError(res, val.error);
  }

  const data: GetJob['QP'] = val.data;
  const job = await prisma.jobs.findFirst({
    where: {
      orgId: data.org_id,
      projectId: data.project_id,
      id: data.job_id,
    },
    include: {
      User: true,
    },
  });

  if (!job) {
    return notFound(res);
  }

  req.job = job;
};
