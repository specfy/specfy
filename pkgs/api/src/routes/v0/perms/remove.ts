import type { Prisma } from '@prisma/client';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { notFound, validationError } from '../../../common/errors';
import { schemaId } from '../../../common/validators';
import { valOrgId, valProjectId } from '../../../common/zod';
import { prisma } from '../../../db';
import { noQuery } from '../../../middlewares/noQuery';
import type { ReqDeletePerms, ResDeletePermsSuccess } from '../../../types/api';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: valOrgId(req),
      project_id: valProjectId(req),
      userId: schemaId,
    })
    .strict()
    .partial({ project_id: true });
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.delete<{
    Body: ReqDeletePerms;
    Reply: ResDeletePermsSuccess;
  }>('/', { preHandler: noQuery }, async function (req, res) {
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
      const perm = await tx.perms.findFirst({ where });
      if (!perm) {
        error = 'not_found';
        return;
      }

      await tx.perms.delete({ where: { id: perm.id } });
    });

    if (error) {
      return notFound(res);
    }

    res.status(204).send();
  });

  done();
};

export default fn;
