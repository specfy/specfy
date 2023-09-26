import { prisma } from '@specfy/db';
import { createUserActivity, schemaUser } from '@specfy/models';
import { z } from 'zod';

import type { PutMe } from '@specfy/models';

import { validationError } from '../../../common/errors.js';
import { noQuery } from '../../../middlewares/noQuery.js';

import type { FastifyPluginCallback } from 'fastify';

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
    let user = req.me!;

    if (data.name) {
      user = await prisma.$transaction(async (tx) => {
        const tmp = await tx.users.update({
          data: { name: data.name },
          where: { id: user.id },
        });
        await createUserActivity({
          user: req.me!,
          action: 'User.updated',
          target: tmp,
          orgId: null,
          tx,
        });

        return tmp;
      });
    }

    return res.status(200).send({
      data: { done: true },
    });
  });
  done();
};

export default fn;
