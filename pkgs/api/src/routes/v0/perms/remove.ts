import type { Prisma } from '@prisma/client';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { notFound, validationError } from '../../../common/errors.js';
import { schemaId, schemaOrgId } from '../../../common/validators/index.js';
import { valPermissions } from '../../../common/zod.js';
import { prisma } from '../../../db/index.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import type { DeletePerm } from '../../../types/api/index.js';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      project_id: schemaId,
      userId: schemaId,
    })
    .strict()
    .partial({ project_id: true })
    .superRefine(valPermissions(req, 'owner'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.delete<DeletePerm>(
    '/',
    { preHandler: noQuery },
    async function (req, res) {
      const val = QueryVal(req).safeParse(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const data = val.data;
      const where: Prisma.PermsWhereInput = {
        orgId: data.org_id,
        userId: data.userId,
      };
      if (data.project_id) {
        where.projectId = data.project_id;
      }

      let error: string | undefined;
      await prisma.$transaction(async (tx) => {
        const perms = await tx.perms.findMany({ where });
        if (!perms) {
          error = 'not_found';
          return;
        }

        await tx.perms.deleteMany({
          where: {
            id: {
              in: perms.map(({ id }) => id),
            },
          },
        });
      });

      if (error) {
        return notFound(res);
      }

      return res.status(204).send();
    }
  );
  done();
};

export default fn;
