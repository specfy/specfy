import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { toApiMe } from '../../../common/formatters/user.js';
import { schemaUser } from '../../../common/validators/user.js';
import { prisma } from '../../../db/index.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import { createUserActivity } from '../../../models/index.js';
import type { PutMe } from '../../../types/api/index.js';

function BodyVal() {
  return z
    .object({
      name: schemaUser.shape.name,
      // TODO: allow email modification
    })
    .strict();
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.put<PutMe>('/', { preHandler: [noQuery] }, async function (req, res) {
    const val = await BodyVal().safeParseAsync(req.body);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const data = val.data;
    let user = req.user!;

    if (data.name) {
      user = await prisma.$transaction(async (tx) => {
        const tmp = await tx.users.update({
          data: { name: data.name },
          where: { id: user.id },
        });
        await createUserActivity({
          user: req.user!,
          action: 'User.updated',
          target: tmp,
          orgId: null,
          tx,
        });

        return tmp;
      });
    }

    return res.status(200).send({
      data: toApiMe(user),
    });
  });
  done();
};

export default fn;
