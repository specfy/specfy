import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import type { WhereOptions } from 'sequelize';
import { Op } from 'sequelize';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { toApiUser } from '../../../common/formatters/user';
import { valOrgId, valProjectId } from '../../../common/zod';
import { db } from '../../../db';
import { User } from '../../../models';
import type {
  Pagination,
  ReqListUsers,
  ResListUsers,
} from '../../../types/api';
import type { DBUser } from '../../../types/db';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: valOrgId(req),
      project_id: valProjectId(req),
      search: z.string().min(1).max(50),
    })
    .strict()
    .partial({ project_id: true, search: true });
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Querystring: ReqListUsers;
    Reply: ResListUsers;
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

    const filter: WhereOptions<DBUser> = {
      // orgId: query.org_id,
    };

    // Search
    // if (query.project_id) {
    //   filter.projectId = query.project_id;
    // }
    if (query.search) {
      filter.name = { [Op.iLike]: `%${query.search}%` };
    }

    // TODO: return author
    const list = await db.transaction(async (transaction) => {
      const tmp = await User.findAll({
        where: {
          // TODO: filter only for this org/project
          ...filter,
        },
        order: [['name', 'ASC']],
        // TODO: add limit/offset to qp
        limit: 10,
        offset: 0,
        transaction,
      });
      const count = await User.count({
        where: {
          ...filter,
        },
        transaction,
      });
      pagination.totalItems = count;

      return tmp;
    });

    res.status(200).send({
      data: list.map(toApiUser),
      pagination,
    });
  });

  done();
};

export default fn;
