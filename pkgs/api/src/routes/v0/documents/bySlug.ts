import { schemaId, schemaOrgId } from '@specfy/core';
import { prisma } from '@specfy/db';
import { toApiDocument } from '@specfy/models';
import type { GetDocumentBySlug } from '@specfy/models';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { notFound, validationError } from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      project_id: schemaId,
      slug: z.string().max(250),
    })
    .strict()
    .superRefine(valPermissions(req, 'viewer'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetDocumentBySlug>('/', async function (req, res) {
    const val = QueryVal(req).safeParse({ ...req.query });
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query: GetDocumentBySlug['Querystring'] = val.data;
    const doc = await prisma.documents.findFirst({
      where: {
        orgId: query.org_id,
        projectId: query.project_id,
        slug: query.slug,
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
