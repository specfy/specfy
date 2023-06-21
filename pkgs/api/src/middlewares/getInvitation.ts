import { z } from 'zod';

import { notFound, validationError } from '../common/errors';
import { schemaId, schemaToken } from '../common/validators';
import { prisma } from '../db';
import type { GetInvitation } from '../types/api';
import type { PreHandler } from '../types/fastify';

export function QueryVal() {
  return z
    .object({
      invitation_id: schemaId,
      token: schemaToken,
    })
    .strict();
}

export const getInvitation: PreHandler<{
  Params: GetInvitation['Params'];
  Querystring: GetInvitation['Querystring'];
}> = async (req, res) => {
  const val = QueryVal().safeParse({ ...req.params, ...req.query });
  if (!val.success) {
    return validationError(res, val.error);
  }

  const data = val.data;
  const invitation = await prisma.invitations.findFirst({
    where: {
      id: data.invitation_id,
      expiresAt: { gte: new Date() },
    },
    include: {
      Org: true,
      User: true,
    },
  });

  if (!invitation) {
    return notFound(res);
  }

  req.invitation = invitation;
};
