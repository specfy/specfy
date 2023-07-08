import type { Prisma } from '@prisma/client';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { schemaOrgId } from '../../../common/validators/common.js';
import { valPermissions } from '../../../common/zod.js';
import { prisma } from '../../../db/index.js';
import type { ListInvitations } from '../../../types/api/index.js';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
    })
    .strict()
    .superRefine(valPermissions(req));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
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
      orderBy: [{ createdAt: 'desc' }, { email: 'asc' }],
      take: 50,
      skip: 0,
    });

    return res.status(200).send({
      data: list.map((inv) => {
        return {
          id: inv.id,
          orgId: inv.orgId,
          email: inv.email,
          userId: inv.userId,
          role: inv.role,
          createdAt: inv.createdAt,
          expiresAt: inv.expiresAt,
        };
      }),
    });
  });

  done();
};

export default fn;
