import { schemaId, schemaOrgId } from '@specfy/core';
import { prisma } from '@specfy/db';
import { z } from 'zod';

import type { Pagination } from '@specfy/core';
import type { ListKeys } from '@specfy/models';

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
    .superRefine(valPermissions(req, 'owner'));
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
