import { schemaId, schemaOrgId } from '@specfy/core';
import { prisma } from '@specfy/db';
import { toApiJobList } from '@specfy/models';
import { z } from 'zod';

import type { Pagination } from '@specfy/core';
import type { Prisma } from '@specfy/db';
import type { ListJobs } from '@specfy/models';

import { validationError } from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';

import type { FastifyPluginCallback, FastifyRequest } from 'fastify';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      project_id: schemaId,
    })
    .strict()
    .superRefine(valPermissions(req, 'viewer'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<ListJobs>('/', async function (req, res) {
    const val = QueryVal(req).safeParse(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query: ListJobs['Querystring'] = val.data;
    const pagination: Pagination = {
      currentPage: 1,
      totalItems: 0,
    };

    const filter: Prisma.JobsWhereInput = {
      orgId: query.org_id,
      projectId: query.project_id,
      type: 'deploy',
    };

    const list = await prisma.$transaction(async (tx) => {
      const tmp = await tx.jobs.findMany({
        where: filter,
        orderBy: { createdAt: 'desc' },
        // TODO: add limit/offset to qp
        take: 20,
        skip: 0,
        include: { User: true },
      });

      const count = await tx.jobs.count({
        where: filter,
      });
      pagination.totalItems = count;

      return tmp;
    });

    return res.status(200).send({
      data: list.map((job) => {
        return toApiJobList(job);
      }),
      pagination,
    });
  });
  done();
};

export default fn;
