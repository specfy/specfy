import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { valOrgId, valProjectId } from '../../../common/zod';
import { db } from '../../../db';
import { noQuery } from '../../../middlewares/noQuery';
import { Perm } from '../../../models';
import type { ReqPostPerms, ResPostPerms } from '../../../types/api';
import type { DBPerm } from '../../../types/db';
import { PermType } from '../../../types/db';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: valOrgId(req),
      project_id: valProjectId(req),
      userId: z.string().uuid(),
      role: z.nativeEnum(PermType),
    })
    .strict()
    .partial({ project_id: true });
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.put<{
    Body: ReqPostPerms;
    Reply: ResPostPerms;
  }>('/', { preHandler: noQuery }, async function (req, res) {
    const val = QueryVal(req).safeParse(req.body);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const data = val.data;
    const body = {
      orgId: data.org_id,
      userId: data.userId,
      projectId: data.project_id || null,
    };

    await db.transaction(async (transaction) => {
      // TODO: invite email
      // TODO: check that user exists
      // TODO: check that user is part of the org
      // TODO: check that user is not the sole owner

      const exist = await Perm.findOne({
        where: body,
        transaction,
      });

      // // Set viewer if we add someone directly from a project
      // const hasOrg = exist.find((perm) => perm.projectId === null);
      // if (!hasOrg) {
      //   await Perm.create(
      //     {
      //       orgId: req.body.org_id,
      //       userId: req.body.userId,
      //       role: 'viewer',
      //     },
      //     { transaction }
      //   );
      // }

      if (exist) {
        await Perm.update(
          {
            role: data.role as DBPerm['role'],
          },
          {
            transaction,
            where: body,
          }
        );
      } else {
        await Perm.create(
          {
            ...body,
            role: data.role as DBPerm['role'],
          },
          { transaction }
        );
      }
    });

    res.status(200).send({
      data: { done: true },
    });
  });

  done();
};

export default fn;
