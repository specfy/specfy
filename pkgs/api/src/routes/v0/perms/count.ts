import { schemaId, schemaOrgId } from '@specfy/core/src/validators/index.js';
import type { Prisma } from '@specfy/db';
import { prisma } from '@specfy/db';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';
import type { GetCountPerms } from '../../../types/api/index.js';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      project_id: schemaId,
    })
    .strict()
    .partial({ project_id: true })
    .superRefine(valPermissions(req, 'viewer'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
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

    return res.status(200).send({
      data: perms,
    });
  });
  done();
};

export default fn;
