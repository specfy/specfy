import type { FastifyPluginCallback } from 'fastify';
import type { WhereOptions } from 'sequelize';
import { Op } from 'sequelize';

import { Revision } from '../../../models';
import type { Pagination } from '../../../types/api';
import type {
  ReqListRevisions,
  ResListRevisions,
} from '../../../types/api/revisions';
import type { DBRevision } from '../../../types/db/revisions';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Querystring: ReqListRevisions;
    Reply: ResListRevisions;
  }>('/', async function (req, res) {
    // TODO: pagination
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
      filter.title = { [Op.iLike]: `%${req.query.search}%` };
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
        return {
          id: rev.id,
          orgId: rev.orgId,
          projectId: rev.projectId,
          title: rev.title,
          description: rev.description,
          locked: rev.locked,
          merged: rev.merged,
          status: rev.status,
          blobs: rev.blobs,
          authors: [], // TODO: fill this
          createdAt: rev.createdAt.toISOString(),
          updatedAt: rev.updatedAt.toISOString(),
          mergedAt: rev.mergedAt?.toISOString(),
          closedAt: rev.closedAt?.toISOString(),
        };
      }),
      pagination,
    });
  });

  done();
};

export default fn;
