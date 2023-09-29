import { schemaId, schemaOrgId } from '@specfy/core';
import { prisma } from '@specfy/db';
import { z } from 'zod';

import type { PutSource } from '@specfy/models';
import type { PreHandler } from '@specfy/models/src/fastify';

import { notFound, validationError } from '../common/errors.js';
import { valPermissions } from '../common/zod.js';

import type { FastifyRequest } from 'fastify';

export function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      project_id: schemaId,
      source_id: schemaId,
    })
    .strict()
    .superRefine(valPermissions(req, 'owner'));
}

export const getSource: PreHandler<{
  Querystring: PutSource['Querystring'];
  Params: PutSource['Params'];
}> = async (req, res) => {
  const val = QueryVal(req).safeParse({ ...req.params, ...req.query });
  if (!val.success) {
    return validationError(res, val.error);
  }

  const data: PutSource['QP'] = val.data;
  const source = await prisma.sources.findFirst({
    where: {
      orgId: data.org_id,
      projectId: data.project_id,
      id: data.source_id,
    },
    include: { Project: true },
  });

  if (!source) {
    return notFound(res);
  }

  req.source = source;
};
