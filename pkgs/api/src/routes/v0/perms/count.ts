import type { Prisma } from '@prisma/client';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { valOrgId, valProjectId } from '../../../common/zod.js';
import { prisma } from '../../../db/index.js';
import type { GetCountPerms } from '../../../types/api/index.js';

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
  fastify.get<GetCountPerms>('/count', async function (req, res) {
    const val = QueryVal(req).safeParse(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query = val.data;
    const where: Prisma.PermsWhereInput = {
      orgId: query.org_id,
      projectId: query.project_id || null,
    };

    const perms = await prisma.perms.count({
      where,
    });

    res.status(200).send({
      data: perms,
    });
  });

  done();
};

export default fn;
