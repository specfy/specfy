import { schemaId, schemaToken } from '@specfy/core';
import { prisma } from '@specfy/db';
import { z } from 'zod';

import type { GetInvitation } from '@specfy/models';
import type { PreHandler } from '@specfy/models/src/fastify';

import { notFound, validationError } from '../common/errors.js';

function QueryVal() {
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

  const data: GetInvitation['Params'] = val.data;
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
