import { schemaId, schemaOrgId } from '@specfy/core';
import { prisma } from '@specfy/db';
import { toApiUser } from '@specfy/models';
import { z } from 'zod';

import type { Pagination } from '@specfy/core';
import type { Prisma } from '@specfy/db';
import type { ListUsers } from '@specfy/models';

import { validationError } from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';

import type { FastifyPluginCallback, FastifyRequest } from 'fastify';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      project_id: schemaId,
      search: z.string().min(1).max(50),
    })
    .strict()
    .partial({ project_id: true, search: true })
    .superRefine(valPermissions(req, 'viewer'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<ListUsers>('/', async function (req, res) {
    const val = QueryVal(req).safeParse(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query = val.data;

    const pagination: Pagination = {
      currentPage: 1,
      totalItems: 0,
    };

    const where: Prisma.UsersWhereInput = {
      Perms: {
        some: { orgId: { equals: query.org_id } },
      },
    };

    // Search
    if (query.project_id) {
      where.Perms!.some!.projectId = query.project_id;
    }
    if (query.search) {
      where.name = { contains: query.search };
    }

    // TODO: return author
    const list = await prisma.$transaction(async (tx) => {
      const tmp = await tx.users.findMany({
        where,
        orderBy: { name: 'asc' },
        // TODO: add limit/offset to qp
        take: 10,
        skip: 0,
      });
      const count = await tx.users.count({
        where,
      });
      pagination.totalItems = count;

      return tmp;
    });

    return res.status(200).send({
      data: list.map(toApiUser),
      pagination,
    });
  });
  done();
};

export default fn;
