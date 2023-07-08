import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { schemaId, schemaOrgId } from '../../../common/validators/common.js';
import { valPermissions } from '../../../common/zod.js';
import { prisma } from '../../../db/index.js';
import type { ListKeys, Pagination } from '../../../types/api/index.js';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      project_id: schemaId,
    })
    .strict()
    .superRefine(valPermissions(req));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<ListKeys>('/', async function (req, res) {
    const val = QueryVal(req).safeParse(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query = val.data;

    // TODO: pagination
    const pagination: Pagination = {
      currentPage: 0,
      totalItems: 0,
    };

    // TODO: perms
    const keys = await prisma.keys.findMany({
      where: {
        orgId: query.org_id,
        projectId: query.project_id,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: 0,
    });

    return res.status(200).send({
      data: keys.map((key) => {
        return { key: key.id, createdAt: key.createdAt.toISOString() };
      }),
      pagination,
    });
  });
  done();
};

export default fn;
