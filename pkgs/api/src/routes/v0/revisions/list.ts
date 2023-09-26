import { schemaId, schemaOrgId } from '@specfy/core';
import { prisma } from '@specfy/db';
import { toApiRevisionList } from '@specfy/models';
import { z } from 'zod';

import type { Pagination } from '@specfy/core';
import type { Prisma } from '@specfy/db';
import type { ListRevisions } from '@specfy/models';

import { validationError } from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';

import type { FastifyPluginCallback, FastifyRequest } from 'fastify';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      project_id: schemaId,
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
    .partial({ project_id: true, search: true, status: true })
    .superRefine(valPermissions(req, 'viewer'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<ListRevisions>('/', async function (req, res) {
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
        include: {
          Project: true,
          TypeHasUsers: { include: { User: true }, where: { role: 'author' } },
        },
      });

      const count = await tx.revisions.count({
        where: filter,
      });
      pagination.totalItems = count;

      return tmp;
    });

    return res.status(200).send({
      data: list.map((rev) => {
        return toApiRevisionList(rev);
      }),
      pagination,
    });
  });
  done();
};

export default fn;
