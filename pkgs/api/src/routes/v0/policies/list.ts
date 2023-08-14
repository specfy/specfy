import { schemaOrgId } from '@specfy/core/src/validators/index.js';
import type { Prisma } from '@specfy/db';
import { prisma } from '@specfy/db';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';
import { toApiPolicy } from '../../../models/policies/formatter.js';
import type { ListPolicies, Pagination } from '../../../types/api/index.js';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
    })
    .strict()
    .superRefine(valPermissions(req, 'viewer'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<ListPolicies>('/', async function (req, res) {
    const val = QueryVal(req).safeParse(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query = val.data;

    // TODO validation
    const pagination: Pagination = {
      currentPage: 1,
      totalItems: 0,
    };

    const where: Prisma.PoliciesWhereInput = {
      orgId: query.org_id,
    };

    const list = await prisma.$transaction(async (tx) => {
      const tmp = await tx.policies.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        // TODO: add limit/offset to qp
        take: 100,
        skip: 0,
      });
      const count = await tx.policies.count({
        where,
      });
      pagination.totalItems = count;

      return tmp;
    });

    return res.status(200).send({
      data: list.map(toApiPolicy),
      pagination,
    });
  });
  done();
};

export default fn;
