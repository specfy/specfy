import { schemaId, schemaOrgId } from '@specfy/core';
import { prisma } from '@specfy/db';
import { v1, DocumentType } from '@specfy/models';
import { z } from 'zod';

import type { Pagination } from '@specfy/core';
import type { Prisma } from '@specfy/db';
import type { ListDocuments } from '@specfy/models';

import { validationError } from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';

import type { FastifyPluginCallback, FastifyRequest } from 'fastify';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      project_id: schemaId,
      search: z.string().min(2).max(50),
      type: z.nativeEnum(DocumentType),
    })
    .strict()
    .partial({ project_id: true, search: true, type: true })
    .superRefine(valPermissions(req, 'viewer'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<ListDocuments>('/', async function (req, res) {
    const val = QueryVal(req).safeParse(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query: ListDocuments['Querystring'] = val.data;

    // TODO: pagination
    const pagination: Pagination = {
      currentPage: 1,
      totalItems: 0,
    };

    const filter: Prisma.DocumentsWhereInput = {
      orgId: query.org_id,
    };

    // Search
    if (query.project_id) {
      filter.projectId = query.project_id;
    }
    if (query.search) {
      filter.name = { contains: query.search };
    }
    if (query.type) {
      filter.type = query.type;
    }

    // TODO: search in content

    const docs = await prisma.$transaction(async (tx) => {
      const tmp = await tx.documents.findMany({
        select: {
          id: true,
          type: true,
          typeId: true,
          parentId: true,
          name: true,
          slug: true,
          tldr: true,
          createdAt: true,
          updatedAt: true,
        },
        where: filter,
        orderBy: [
          { typeId: 'desc' },
          { name: 'asc' },
          { parentId: { sort: 'asc', nulls: 'first' } },
        ],
        // TODO: add limit/offset to qp
        take: v1.pro.upload.maxDocuments,
        skip: 0,
      });

      const count = await tx.documents.count({
        where: filter,
      });
      pagination.totalItems = count;

      return tmp;
    });

    return res.status(200).send({
      data: docs.map((p) => {
        // For excess property check
        const tmp: ListDocuments['Success']['data'][0] = {
          id: p.id,

          type: p.type,
          typeId: p.typeId,
          parentId: p.parentId,

          name: p.name,
          slug: p.slug,
          tldr: p.tldr,

          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
        return tmp;
      }),
      pagination,
    });
  });
  done();
};

export default fn;
