import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import type { WhereOptions } from 'sequelize';
import { Op } from 'sequelize';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { toApiRevision } from '../../../common/formatters/revision';
import { valOrgId, valProjectId } from '../../../common/zod';
import { db } from '../../../db';
import { Revision } from '../../../models';
import type {
  Pagination,
  ReqListRevisions,
  ResListRevisions,
} from '../../../types/api';
import type { DBRevision } from '../../../types/db';

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
    Reply: ResListRevisions;
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

    const filter: WhereOptions<DBRevision> = {
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
        filter.mergedAt = { [Op.is]: null };
      }
    }

    // Search
    if (query.search) {
      filter.name = { [Op.iLike]: `%${query.search}%` };
    }
    // TODO: search in content

    // TODO: return author
    const list = await db.transaction(async (transaction) => {
      const tmp = await Revision.findAll({
        where: filter,
        order: [['createdAt', 'DESC']],
        // TODO: add limit/offset to qp
        limit: 10,
        offset: 0,
        transaction,
      });

      const count = await Revision.count({
        where: filter,
        transaction,
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
