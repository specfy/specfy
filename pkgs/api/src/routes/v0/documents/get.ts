import { schemaId, schemaOrgId } from '@specfy/core/src/validators/index.js';
import { prisma } from '@specfy/db';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { notFound, validationError } from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';
import { toApiUser } from '../../../models/users/formatter.js';
import type { GetDocument } from '../../../types/api/index.js';

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
    const p = await prisma.documents.findFirst({
      where: {
        id: query.document_id,
        orgId: query.org_id,
        projectId: query.project_id,
      },
    });

    if (!p) {
      return notFound(res);
    }

    const users = await prisma.typeHasUsers.findMany({
      where: {
        documentId: p.id,
      },
      include: { User: true },
    });

    return res.status(200).send({
      data: {
        id: p.id,
        orgId: p.orgId,
        projectId: p.projectId,
        blobId: p.blobId,

        type: p.type,
        typeId: p.typeId,

        source: p.source,
        sourcePath: p.sourcePath,
        parentId: p.parentId,

        name: p.name,
        slug: p.slug,
        tldr: p.tldr,
        content: p.content,
        authors: users
          .filter((user) => user.role === 'author')
          .map((u) => toApiUser(u.User)),
        reviewers: users
          .filter((user) => user.role === 'reviewer')
          .map((u) => toApiUser(u.User)),
        // TODO: fill this
        approvedBy: [],
        locked: p.locked,

        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      },
    });
  });
  done();
};

export default fn;
