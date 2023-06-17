import type { FastifyPluginCallback } from 'fastify';

import { nanoid } from '../../../common/id';
import { prisma } from '../../../db';
import { noBody } from '../../../middlewares/noBody';
import { noQuery } from '../../../middlewares/noQuery';
import { createUserActivity } from '../../../models';
import type { ResDeleteMe } from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.delete<{
    Reply: ResDeleteMe;
  }>('/', { preHandler: [noQuery, noBody] }, async function (req, res) {
    const user = req.user!;

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
      await createUserActivity(user, 'User.deleted', user, null, tx);

      // TODO: maybe delete permissions too?
    });

    await req.logOut();

    res.status(204).send();
  });

  done();
};

export default fn;
