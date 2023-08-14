import { schemaId, schemaOrgId } from '@specfy/core/src/validators/index.js';
import type { Prisma } from '@specfy/db';
import { prisma } from '@specfy/db';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';
import { toApiActivity } from '../../../models/activities/formatter.js';
import type { ListActivities } from '../../../types/api/index.js';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      project_id: schemaId,
      revision_id: schemaId,
    })
    .strict()
    .partial({ project_id: true, revision_id: true })
    .superRefine(valPermissions(req, 'viewer'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<ListActivities>('/', async function (req, res) {
    const val = QueryVal(req).safeParse(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query: ListActivities['Querystring'] = val.data;
    const where: Prisma.ActivitiesWhereInput = {
      orgId: query.org_id,
    };
    if (query.project_id) {
      where.projectId = query.project_id;
    } else {
      // where.projectId = null;
      where.OR = [{ projectId: null }, { action: 'Project.created' }];
    }

    if (query.revision_id) {
      where.targetRevisionId = query.revision_id;
    }

    // TODO: cursor pagination
    const activities = await prisma.activities.findMany({
      where,
      include: {
        Project: {
          select: { id: true, name: true, slug: true },
        },
        User: true,
        Blob: true,
        Revision: {
          select: {
            id: true,
            name: true,
            status: true,
            locked: true,
            merged: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: 0,
    });

    return res.status(200).send({
      data: activities.map(toApiActivity),
    });
  });
  done();
};

export default fn;
