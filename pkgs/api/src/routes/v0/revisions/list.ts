import type { FastifyPluginCallback } from 'fastify';
import type { WhereOptions } from 'sequelize';
import { Op } from 'sequelize';

import { toApiRevision } from '../../../common/formatters/revision';
import { Revision } from '../../../models';
import type {
  Pagination,
  ReqListRevisions,
  ResListRevisions,
} from '../../../types/api';
import type { DBRevision } from '../../../types/db';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Querystring: ReqListRevisions;
    Reply: ResListRevisions;
  }>('/', async function (req, res) {
    const pagination: Pagination = {
      currentPage: 1,
      totalItems: 0,
    };

    const filter: WhereOptions<DBRevision> = {};

    // Status filtering
    if (req.query.status) {
      if (req.query.status === 'merged') {
        filter.merged = true;
      } else if (req.query.status === 'opened') {
        filter.mergedAt = null;
        filter.closedAt = null;
      } else if (req.query.status !== 'all') {
        filter.status = req.query.status;
        filter.mergedAt = { [Op.is]: null };
      }
    }

    // Search
    if (req.query.search) {
      filter.name = { [Op.iLike]: `%${req.query.search}%` };
    }
    // TODO: search in content

    // TODO: return author
    const list = await Revision.findAll({
      where: {
        // TODO validation
        orgId: req.query.org_id,
        projectId: req.query.project_id,
        ...filter,
      },
      order: [['createdAt', 'DESC']],
      // TODO: add limit/offset to qp
      limit: 10,
      offset: 0,
    });
    const count = await Revision.count({
      where: {
        // TODO validation
        orgId: req.query.org_id,
        projectId: req.query.project_id,
        ...filter,
      },
    });
    pagination.totalItems = count;

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
