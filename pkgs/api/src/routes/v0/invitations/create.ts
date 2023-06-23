import { Prisma } from '@prisma/client';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { nanoid } from '../../../common/id.js';
import { getOrgFromRequest } from '../../../common/perms.js';
import { valOrgId } from '../../../common/zod.js';
import { prisma } from '../../../db/index.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import { v1, EXPIRES } from '../../../models/index.js';
import type { PostInvitation } from '../../../types/api/index.js';
import { PermType } from '../../../types/db/index.js';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      orgId: valOrgId(req),
      email: z.string().max(250).email(),
      role: z.nativeEnum(PermType),
    })
    .strict()
    .superRefine(async (val, ctx) => {
      const count = await prisma.perms.count({
        where: {
          orgId: val.orgId,
          User: { email: val.email },
          projectId: null,
        },
      });
      if (count > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          params: { code: 'exists' },
          message: 'User is already part of this organization',
          path: ['email'],
        });
      }

      const org = getOrgFromRequest(req, val.orgId);
      if (!org) {
        return;
      }

      const max = org.isPersonal ? v1.free.org.maxUser : v1.paid.org.maxUser;
      const check = await prisma.$queryRaw<[{ total: number }]>(
        Prisma.sql`SELECT (SELECT COUNT(*) FROM "Perms" WHERE "orgId" = ${val.orgId} AND "projectId" IS NULL)
         + (SELECT COUNT(*) FROM "Invitations" WHERE "orgId" = ${val.orgId}) as total LIMIT 1`
      );

      if (check[0].total > max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          params: { code: 'max' },
          message:
            "You can't have more people in your team, contact us if you need more",
          path: ['email'],
        });
      }
    });
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<PostInvitation>(
    '/',
    { preHandler: noQuery },
    async function (req, res) {
      const val = await QueryVal(req).safeParseAsync(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const body = val.data;

      // Dedup and invalidate old invites
      await prisma.invitations.deleteMany({
        where: {
          email: body.email,
          orgId: body.orgId,
        },
      });

      const created = await prisma.invitations.create({
        data: {
          id: nanoid(),
          email: body.email,
          orgId: body.orgId,
          role: body.role,
          token: nanoid(32),
          userId: req.user!.id,
          expiresAt: new Date(Date.now() + EXPIRES),
        },
      });

      res.status(200).send({
        data: { token: created.token, id: created.id },
      });
    }
  );

  done();
};

export default fn;
