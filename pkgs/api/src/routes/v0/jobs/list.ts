import type { Prisma } from '@prisma/client';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { schemaId, schemaOrgId } from '../../../common/validators/index.js';
import { valPermissions } from '../../../common/zod.js';
import { prisma } from '../../../db/index.js';
import { toApiJob } from '../../../models/jobs/formatter.js';
import type { ListJobs, Pagination } from '../../../types/api/index.js';

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
        return toApiJob(job);
      }),
      pagination,
    });
  });
  done();
};

export default fn;
