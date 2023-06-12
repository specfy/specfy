import type { Prisma } from '@prisma/client';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { toApiRevision } from '../../../common/formatters/revision';
import { valOrgId, valProjectId } from '../../../common/zod';
import { prisma } from '../../../db';
import type {
  Pagination,
  ReqListRevisions,
  ResListRevisionsSuccess,
} from '../../../types/api';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: valOrgId(req),
      project_id: valProjectId(req),
      search: z.string().min(1).max(50),
      status: z.enum([
        'all',
        'approved',
        'closed',
        'draft',
        'merged',
        'opened',
        'waiting',
      ]),
    })
    .strict()
    .partial({ project_id: true, search: true, status: true });
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Querystring: ReqListRevisions;
    Reply: ResListRevisionsSuccess;
  }>('/', async function (req, res) {
    const val = QueryVal(req).safeParse(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query = val.data;
    const pagination: Pagination = {
      currentPage: 1,
      totalItems: 0,
    };

    const filter: Prisma.RevisionsWhereInput = {
      orgId: query.org_id,
    };

    if (query.project_id) {
      filter.projectId = query.project_id;
    }

    // Status filtering
    if (query.status) {
      if (query.status === 'merged') {
        filter.merged = true;
      } else if (query.status === 'opened') {
        filter.mergedAt = null;
        filter.closedAt = null;
      } else if (query.status !== 'all') {
        filter.status = query.status;
        filter.mergedAt = null;
      }
    }

    // Search
    if (query.search) {
      filter.name = { contains: query.search };
    }
    // TODO: search in content

    // TODO: return author
    const list = await prisma.$transaction(async (tx) => {
      const tmp = await tx.revisions.findMany({
        where: filter,
        orderBy: { createdAt: 'desc' },
        // TODO: add limit/offset to qp
        take: 10,
        skip: 0,
        include: { Project: true },
      });

      const count = await tx.revisions.count({
        where: filter,
      });
      pagination.totalItems = count;

      return tmp;
    });

    res.status(200).send({
      data: list.map((rev) => {
        return toApiRevision(rev, [] /* TODO: fill authors */);
      }),
      pagination,
    });
  });

  done();
};

export default fn;
