import type { FastifyPluginCallback } from 'fastify';
import type { WhereOptions } from 'sequelize';
import { Op } from 'sequelize';

import { Document } from '../../../models';
import type {
  ReqListDocuments,
  ResListDocuments,
  Pagination,
} from '../../../types/api';
import type { DBDocument } from '../../../types/db/documents';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{ Querystring: ReqListDocuments; Reply: ResListDocuments }>(
    '/',
    async function (req, res) {
      // TODO: pagination
      const pagination: Pagination = {
        currentPage: 1,
        totalItems: 0,
      };

      const filter: WhereOptions<DBDocument> = {};

      // Search
      if (req.query.search) {
        filter.name = { [Op.iLike]: `%${req.query.search}%` };
      }
      // TODO: search in content

      // TODO: return author
      const docs = await Document.findAll({
        where: {
          // TODO: validation
          orgId: req.query.org_id,
          projectId: req.query.project_id,
          ...filter,
        },
        order: [['typeId', 'DESC']],
        // TODO: add limit/offset to qp
        limit: 10,
        offset: 0,
      });
      const count = await Document.count({
        where: {
          // TODO validation
          orgId: req.query.org_id,
          projectId: req.query.project_id,
          ...filter,
        },
      });
      pagination.totalItems = count;

      res.status(200).send({
        data: docs.map((p) => {
          // For excess property check
          const tmp: ResListDocuments['data'][0] = {
            id: p.id,
            orgId: p.orgId,
            projectId: p.projectId,
            blobId: p.blobId,

            type: p.type,
            typeId: p.typeId,
            name: p.name,
            slug: p.slug,
            tldr: p.tldr,
            // TODO: remove all this in /list
            content: {} as any,
            // TODO: fill this
            authors: [],
            // TODO: remove this in /list
            reviewers: [],
            approvedBy: [],
            locked: p.locked,

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
