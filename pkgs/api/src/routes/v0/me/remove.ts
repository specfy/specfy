import { nanoid } from '@specfy/core';
import { prisma } from '@specfy/db';
import type { FastifyPluginCallback } from 'fastify';

import { noBody } from '../../../middlewares/noBody.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import { createUserActivity } from '../../../models/index.js';
import type { DeleteMe } from '../../../types/api/index.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.delete<DeleteMe>(
    '/',
    { preHandler: [noQuery, noBody] },
    async function (req, res) {
      const user = req.me!;

      await prisma.$transaction(async (tx) => {
        await tx.accounts.deleteMany({ where: { userId: user.id } });
        await tx.users.update({
          data: {
            name: 'Deleted Account',
            email: `${nanoid()}@deleted.specfy.io`,
            password: null,
            emailVerifiedAt: null,
          },
          where: {
            id: user.id,
          },
        });
        await createUserActivity({
          user,
          action: 'User.deleted',
          target: user,
          orgId: null,
          tx,
        });

        // TODO: maybe delete permissions too?
      });

      await req.logOut();

      return res.status(204).send();
    }
  );
  done();
};

export default fn;
