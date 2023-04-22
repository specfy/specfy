import type { Prisma } from '@prisma/client';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { toApiActivity } from '../../../common/formatters/activity';
import { valOrgId, valProjectId } from '../../../common/zod';
import { prisma } from '../../../db';
import type {
  ReqListActivities,
  ResListActivitiesSuccess,
} from '../../../types/api';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: valOrgId(req),
      project_id: valProjectId(req),
    })
    .strict()
    .partial({ project_id: true });
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Querystring: ReqListActivities;
    Reply: ResListActivitiesSuccess;
  }>('/', async function (req, res) {
    const val = QueryVal(req).safeParse(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query = val.data;
    const where: Prisma.ActivitiesWhereInput = {
      orgId: query.org_id,
    };
    if (query.project_id) {
      where.projectId = query.project_id;
    }

    // TODO: cursor pagination
    const activities = await prisma.activities.findMany({
      where,
      include: {
        Project: { select: { id: true, name: true, slug: true } },
        User: true,
        Blob: true,
      },
      orderBy: { createdAt: 'asc' },
      take: 10,
      skip: 0,
    });

    res.status(200).send({
      data: activities.map(toApiActivity),
    });
  });

  done();
};

export default fn;
