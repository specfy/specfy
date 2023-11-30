import { schemaId } from '@specfy/core';
import { prisma } from '@specfy/db';
import { z } from 'zod';

import type { GetUser } from '@specfy/models';
import type { PreHandler } from '@specfy/models/src/fastify';

import { notFound, validationError } from '../common/errors.js';

function QueryVal() {
  return z
    .object({
      user_id: schemaId,
    })
    .strict();
}

export const getUser: PreHandler<{
  Params: GetUser['Params'];
}> = async (req, res) => {
  const val = QueryVal().safeParse({
    ...req.params,
  });
  if (!val.success) {
    return validationError(res, val.error);
  }

  const data: GetUser['Params'] = val.data;
  const proj = await prisma.users.findFirst({
    where: {
      id: data.user_id,
    },
  });

  if (!proj) {
    return notFound(res);
  }

  req.user = proj;
};
