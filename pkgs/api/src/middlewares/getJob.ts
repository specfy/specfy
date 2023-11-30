import { schemaId, schemaOrgId } from '@specfy/core';
import { prisma } from '@specfy/db';
import { z } from 'zod';

import type { GetJob } from '@specfy/models';
import type { PreHandler } from '@specfy/models/src/fastify';

import { notFound, validationError } from '../common/errors.js';
import { valPermissions } from '../common/zod.js';

import type { FastifyRequest } from 'fastify';

function QueryVal(req: FastifyRequest) {
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
      Revisions: { select: { id: true } },
    },
  });

  if (!job) {
    return notFound(res);
  }

  req.job = job;
};
