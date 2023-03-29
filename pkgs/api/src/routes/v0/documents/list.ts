import type { FastifyPluginCallback } from 'fastify';
import type { WhereOptions } from 'sequelize';
import { Op } from 'sequelize';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { valOrgId, valId } from '../../../common/zod';
import { db } from '../../../db';
import type { Perm } from '../../../models';
import { Document } from '../../../models';
import type {
  ReqListDocuments,
  ResListDocuments,
  Pagination,
} from '../../../types/api';
import type { DBDocument } from '../../../types/db';
import { DocumentType } from '../../../types/db';

function QueryVal(perms: Perm[]) {
  return z
    .object({
      org_id: valOrgId(perms),
      project_id: valId(),
      search: z.string().min(2).max(50),
      type: z.string().refine(
        (val) => {
          return val in DocumentType;
        },
        {
          message: 'Invalid document type',
        }
      ),
    })
    .strict()
    .partial({ project_id: true, search: true, type: true });
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{ Querystring: ReqListDocuments; Reply: ResListDocuments }>(
    '/',
    async function (req, res) {
      const val = QueryVal(req.perms!).safeParse(req.query);
      if (!val.success) {
        validationError(res, val.error);
        return;
      }

      const query = val.data;

      // TODO: pagination
      const pagination: Pagination = {
        currentPage: 1,
        totalItems: 0,
      };

      const filter: WhereOptions<DBDocument> = {
        orgId: query.org_id,
      };

      // Search
      if (query.project_id) {
        filter.projectId = query.project_id;
      }
      if (query.search) {
        filter.name = { [Op.iLike]: `%${query.search}%` };
      }
      if (query.type) {
        filter.type = query.type;
      }

      // TODO: search in content

      const docs = await db.transaction(async (transaction) => {
        const tmp = await Document.findAll({
          // prettier-ignore
          attributes: [ 'id', 'type', 'typeId', 'name', 'slug', 'tldr', 'createdAt', 'updatedAt' ],
          where: filter,
          order: [['typeId', 'DESC']],
          // TODO: add limit/offset to qp
          limit: 200,
          offset: 0,
          transaction,
        });

        const count = await Document.count({
          where: filter,
          transaction,
        });
        pagination.totalItems = count;

        return tmp;
      });

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
