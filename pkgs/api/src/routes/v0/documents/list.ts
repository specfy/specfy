import type { Prisma } from '@prisma/client';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { valOrgId, valProjectId } from '../../../common/zod';
import { prisma } from '../../../db';
import type {
  ReqListDocuments,
  ResListDocuments,
  Pagination,
  ApiDocument,
} from '../../../types/api';
import { DocumentType } from '../../../types/db';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: valOrgId(req),
      project_id: valProjectId(req),
      search: z.string().min(2).max(50),
      type: z.nativeEnum(DocumentType),
    })
    .strict()
    .partial({ project_id: true, search: true, type: true });
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{ Querystring: ReqListDocuments; Reply: ResListDocuments }>(
    '/',
    async function (req, res) {
      const val = QueryVal(req).safeParse(req.query);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const query = val.data;

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
            name: true,
            slug: true,
            tldr: true,
            createdAt: true,
            updatedAt: true,
          },
          where: filter,
          orderBy: { typeId: 'desc' },
          // TODO: add limit/offset to qp
          take: 200,
          skip: 0,
        });

        const count = await tx.documents.count({
          where: filter,
        });
        pagination.totalItems = count;

        return tmp;
      });

      res.status(200).send({
        data: docs.map((p) => {
          // For excess property check
          const tmp: ResListDocuments['data'][0] = {
            id: p.id,

            type: p.type as ApiDocument['type'],
            typeId: p.typeId,
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
    }
  );

  done();
};

export default fn;
