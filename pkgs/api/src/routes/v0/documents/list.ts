import type { FastifyPluginCallback } from 'fastify';
import type { WhereOptions } from 'sequelize';
import { Op } from 'sequelize';

import { Document } from '../../../models';
import type {
  ReqListDocuments,
  ResListDocuments,
  Pagination,
} from '../../../types/api';
import type { DBDocument } from '../../../types/db';

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
      if (req.query.type) {
        filter.type = req.query.type;
      }
      // TODO: search in content

      const docs = await Document.findAll({
        // prettier-ignore
        attributes: [ 'id', 'type', 'typeId', 'name', 'slug', 'tldr', 'createdAt', 'updatedAt' ],
        where: {
          // TODO: validation
          orgId: req.query.org_id,
          projectId: req.query.project_id,
          ...filter,
        },
        order: [['typeId', 'DESC']],
        // TODO: add limit/offset to qp
        limit: 200,
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

            type: p.type,
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
