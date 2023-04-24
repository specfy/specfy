import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { toApiMe } from '../../../common/formatters/user';
import { schemaUser } from '../../../common/validators/user';
import { prisma } from '../../../db';
import { noQuery } from '../../../middlewares/noQuery';
import { createUserActivity } from '../../../models';
import type { ReqPutMe, ResPutMeSuccess } from '../../../types/api';

function BodyVal() {
  return z
    .object({
      name: schemaUser.shape.name,
      // TODO: allow email modification
    })
    .strict();
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.put<{ Reply: ResPutMeSuccess; Body: ReqPutMe }>(
    '/',
    { preHandler: [noQuery] },
    async function (req, res) {
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
          await createUserActivity(req.user!, 'User.updated', tmp, tx);

          return tmp;
        });
      }

      res.status(200).send({
        data: toApiMe(user),
      });
    }
  );

  done();
};

export default fn;
