import type { FastifyPluginCallback } from 'fastify';
import type { WhereOptions } from 'sequelize';
import { z } from 'zod';

import { notFound, validationError } from '../../../common/errors';
import { valOrgId, valId } from '../../../common/zod';
import { db } from '../../../db';
import { noQuery } from '../../../middlewares/noQuery';
import { Perm } from '../../../models';
import type { ReqDeletePerms, ResDeletePerms } from '../../../types/api';
import type { DBPerm } from '../../../types/db';

function QueryVal(perms: Perm[]) {
  return z
    .object({
      org_id: valOrgId(perms),
      project_id: valId(),
      userId: z.string().uuid(),
    })
    .strict()
    .partial({ project_id: true });
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.delete<{
    Body: ReqDeletePerms;
    Reply: ResDeletePerms;
  }>('/', { preHandler: noQuery }, async function (req, res) {
    const val = QueryVal(req.perms!).safeParse(req.body);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const data = val.data;
    const where: WhereOptions<DBPerm> = {
      orgId: data.org_id,
      userId: data.userId,
    };
    if (data.project_id) {
      where.projectId = data.project_id;
    }

    let error: string | undefined;
    await db.transaction(async (transaction) => {
      const perm = await Perm.findOne({ where, transaction });
      if (!perm) {
        error = 'not_found';
        return;
      }

      await Perm.destroy({ where, transaction });
    });

    if (error) {
      return notFound(res);
    }

    res.status(204).send();
  });

  done();
};

export default fn;
