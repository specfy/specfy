import type { FastifyPluginCallback } from 'fastify';

import { Revision } from '../../../models';
import type { Pagination } from '../../../types/api';
import type {
  ReqListRevisions,
  ResListRevisions,
} from '../../../types/api/revisions';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Querystring: ReqListRevisions;
    Reply: ResListRevisions;
  }>('/', async function (req, res) {
    // TODO: pagination
    const pagination: Pagination = {
      current: 0,
      page: 0,
      total: 0,
    };

    const list = await Revision.findAll({
      where: {
        // TODO validation
        orgId: req.query.org_id,
        projectId: req.query.project_id,
      },
      order: [['createdAt', 'DESC']],
      limit: 10,
      offset: 0,
    });

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
        };
      }),
      pagination,
    });
  });

  done();
};

export default fn;
