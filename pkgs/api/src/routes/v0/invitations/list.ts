import type { Prisma } from '@prisma/client';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { valOrgId } from '../../../common/zod';
import { prisma } from '../../../db';
import type { ListInvitations } from '../../../types/api';
import type { PermType } from '../../../types/db';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: valOrgId(req),
    })
    .strict();
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<ListInvitations>('/', async function (req, res) {
    const val = QueryVal(req).safeParse(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query = val.data;
    const where: Prisma.InvitationsWhereInput = {
      orgId: query.org_id,
      expiresAt: { gte: new Date() },
    };

    // TODO: pagination
    const list = await prisma.invitations.findMany({
      where,
      orderBy: { email: 'asc' },
      take: 50,
      skip: 0,
    });

    res.status(200).send({
      data: list.map((inv) => {
        return {
          id: inv.id,
          orgId: inv.orgId,
          email: inv.email,
          userId: inv.userId,
          role: inv.role as PermType,
          createdAt: inv.createdAt,
          expiresAt: inv.expiresAt,
        };
      }),
    });
  });

  done();
};

export default fn;
