import type { FastifyPluginCallback } from 'fastify';
import type { WhereOptions } from 'sequelize';
import { Op } from 'sequelize';

import { toApiUser } from '../../../common/formatters/user';
import { User } from '../../../models';
import type {
  Pagination,
  ReqListUsers,
  ResListUsers,
} from '../../../types/api';
import type { DBUser } from '../../../types/db';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Querystring: ReqListUsers;
    Reply: ResListUsers;
  }>('/', async function (req, res) {
    // TODO validation
    const pagination: Pagination = {
      currentPage: 1,
      totalItems: 0,
    };

    const filter: WhereOptions<DBUser> = {};

    // Search
    if (req.query.search) {
      filter.name = { [Op.iLike]: `%${req.query.search}%` };
    }

    // TODO: return author
    const list = await User.findAll({
      where: {
        // TODO: filter only for this org/project
        ...filter,
      },
      order: [['name', 'ASC']],
      // TODO: add limit/offset to qp
      limit: 10,
      offset: 0,
    });
    const count = await User.count({
      where: {
        ...filter,
      },
    });
    pagination.totalItems = count;

    res.status(200).send({
      data: list.map(toApiUser),
      pagination,
    });
  });

  done();
};

export default fn;
