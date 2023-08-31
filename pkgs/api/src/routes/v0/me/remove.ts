import { logEvent, nanoid } from '@specfy/core';
import { prisma } from '@specfy/db';
import { createUserActivity } from '@specfy/models';
import type { DeleteMe } from '@specfy/models';
import type { FastifyPluginCallback } from 'fastify';

import { noBody } from '../../../middlewares/noBody.js';
import { noQuery } from '../../../middlewares/noQuery.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.delete<DeleteMe>(
    '/',
    { preHandler: [noQuery, noBody] },
    async function (req, res) {
      const me = req.me!;

      await prisma.$transaction(async (tx) => {
        await tx.accounts.deleteMany({ where: { userId: me.id } });
        await tx.users.update({
          data: {
            name: 'Deleted Account',
            email: `${nanoid()}@deleted.specfy.io`,
            password: null,
            emailVerifiedAt: null,
          },
          where: {
            id: me.id,
          },
        });
        await createUserActivity({
          user: me,
          action: 'User.deleted',
          target: me,
          orgId: null,
          tx,
        });

        // TODO: maybe delete permissions too?
      });

      logEvent('account.deleted', { userId: me.id });

      await req.logOut();

      return res.status(204).send();
    }
  );
  done();
};

export default fn;
