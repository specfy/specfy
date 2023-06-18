import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { nanoid } from '../../../common/id';
import { valOrgId } from '../../../common/zod';
import { prisma } from '../../../db';
import { noQuery } from '../../../middlewares/noQuery';
import { EXPIRES } from '../../../models/invitations';
import type {
  ReqPostInvitations,
  ResPostInvitations,
} from '../../../types/api';
import { PermType } from '../../../types/db';

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
    });
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{
    Body: ReqPostInvitations;
    Reply: ResPostInvitations;
  }>('/', { preHandler: noQuery }, async function (req, res) {
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
  });

  done();
};

export default fn;
