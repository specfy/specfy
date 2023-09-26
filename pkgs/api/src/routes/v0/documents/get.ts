import { schemaId, schemaOrgId } from '@specfy/core';
import { prisma } from '@specfy/db';
import { toApiDocument } from '@specfy/models';
import { z } from 'zod';

import type { GetDocument } from '@specfy/models';

import { notFound, validationError } from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';

import type { FastifyPluginCallback, FastifyRequest } from 'fastify';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      project_id: schemaId,
      document_id: schemaId,
    })
    .strict()
    .superRefine(valPermissions(req, 'viewer'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetDocument>('/:document_id', async function (req, res) {
    const val = QueryVal(req).safeParse({ ...req.query, ...req.params });
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query: GetDocument['QP'] = val.data;
    const doc = await prisma.documents.findFirst({
      where: {
        id: query.document_id,
        orgId: query.org_id,
        projectId: query.project_id,
      },
    });

    if (!doc) {
      return notFound(res);
    }

    const users = await prisma.typeHasUsers.findMany({
      where: {
        documentId: doc.id,
      },
      include: { User: true },
    });

    return res.status(200).send({
      data: toApiDocument(doc, users),
    });
  });
  done();
};

export default fn;
