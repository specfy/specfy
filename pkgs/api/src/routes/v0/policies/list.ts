import type { FastifyPluginCallback } from 'fastify';
import type { WhereOptions } from 'sequelize';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { valOrgId } from '../../../common/zod';
import { db } from '../../../db';
import type { Perm } from '../../../models';
import { Policy } from '../../../models';
import type {
  Pagination,
  ReqListPolicies,
  ResListPolicies,
} from '../../../types/api';
import type { DBPolicy } from '../../../types/db';

function QueryVal(perms: Perm[]) {
  return z
    .object({
      org_id: valOrgId(perms),
    })
    .strict();
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Querystring: ReqListPolicies;
    Reply: ResListPolicies;
  }>('/', async function (req, res) {
    const val = QueryVal(req.perms!).safeParse(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query = val.data;

    // TODO validation
    const pagination: Pagination = {
      currentPage: 1,
      totalItems: 0,
    };

    const filter: WhereOptions<DBPolicy> = {
      orgId: query.org_id,
    };

    const list = await db.transaction(async (transaction) => {
      const tmp = await Policy.findAll({
        where: {
          ...filter,
        },
        order: [['createdAt', 'ASC']],
        // TODO: add limit/offset to qp
        limit: 100,
        offset: 0,
        transaction,
      });
      const count = await Policy.count({
        where: {
          ...filter,
        },
        transaction,
      });
      pagination.totalItems = count;

      return tmp;
    });

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
