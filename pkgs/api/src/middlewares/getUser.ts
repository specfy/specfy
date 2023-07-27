import { z } from 'zod';

import { notFound, validationError } from '../common/errors.js';
import { schemaId } from '../common/validators/index.js';
import { prisma } from '../db/index.js';
import type { GetUser } from '../types/api/index.js';
import type { PreHandler } from '../types/fastify.js';

export function QueryVal() {
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
