import type { FastifyPluginCallback } from 'fastify';
import type { WhereOptions } from 'sequelize';

import { Policy } from '../../../models';
import type {
  Pagination,
  ReqListPolicies,
  ResListPolicies,
} from '../../../types/api';
import type { DBPolicy } from '../../../types/db';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Querystring: ReqListPolicies;
    Reply: ResListPolicies;
  }>('/', async function (req, res) {
    // TODO validation
    const pagination: Pagination = {
      currentPage: 1,
      totalItems: 0,
    };

    const filter: WhereOptions<DBPolicy> = {
      orgId: req.query.org_id,
    };

    const list = await Policy.findAll({
      where: {
        ...filter,
      },
      order: [['createdAt', 'ASC']],
      // TODO: add limit/offset to qp
      limit: 100,
      offset: 0,
    });
    const count = await Policy.count({
      where: {
        ...filter,
      },
    });
    pagination.totalItems = count;

    res.status(200).send({
      data: list.map((policy) => {
        return {
          id: policy.id,
          orgId: policy.orgId,
          type: policy.type,
          tech: policy.tech,
          name: policy.name,
          content: policy.content,
          createdAt: policy.createdAt.toISOString(),
          updatedAt: policy.updatedAt.toISOString(),
        };
      }),
      pagination,
    });
  });

  done();
};

export default fn;
