import { nanoid, schemaId, schemaOrgId } from '@specfy/core';
import { prisma } from '@specfy/db';
import { PermType } from '@specfy/models';
import { z } from 'zod';

import type { PutPerm } from '@specfy/models';

import { validationError } from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';
import { noQuery } from '../../../middlewares/noQuery.js';

import type { FastifyPluginCallback, FastifyRequest } from 'fastify';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      project_id: schemaId,
      userId: schemaId,
      role: z.nativeEnum(PermType),
    })
    .strict()
    .partial({ project_id: true })
    .superRefine(valPermissions(req, 'owner'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.put<PutPerm>('/', { preHandler: noQuery }, async function (req, res) {
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

    await prisma.$transaction(async (tx) => {
      // TODO: invite email
      // TODO: check that user exists
      // TODO: check that user is part of the org
      // TODO: check that user is not the sole owner

      const exist = await tx.perms.findFirst({
        where: body,
      });

      // // Set viewer if we add someone directly from a project
      // const hasOrg = exist.find((perm) => perm.projectId === null);
      // if (!hasOrg) {
      //   await Perm.create(
      //     {
      //       orgId: data.org_id,
      //       userId: data.userId,
      //       role: 'viewer',
      //     },
      //     { transaction }
      //   );
      // }

      if (exist) {
        await tx.perms.update({
          data: { role: data.role },
          where: { id: exist.id },
        });
      } else {
        await tx.perms.create({
          data: { id: nanoid(), ...body, role: data.role },
        });
      }
    });

    return res.status(200).send({
      data: { done: true },
    });
  });
  done();
};

export default fn;
