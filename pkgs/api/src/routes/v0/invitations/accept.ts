import type { FastifyPluginCallback } from 'fastify';

import { forbidden } from '../../../common/errors';
import { nanoid } from '../../../common/id';
import { prisma } from '../../../db';
import { getInvitation } from '../../../middlewares/getInvitation';
import { noBody } from '../../../middlewares/noBody';
import { createUserActivity } from '../../../models';
import type { AcceptInvitation } from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<AcceptInvitation>(
    '/',
    { preHandler: [noBody, getInvitation] },
    async function (req, res) {
      const inv = req.invitation!;
      const user = req.user!;

      if (user.email !== inv.email) {
        return forbidden(res);
      }

      await prisma.$transaction(async (tx) => {
        await tx.perms.create({
          data: {
            id: nanoid(),
            orgId: inv.orgId,
            projectId: null,
            userId: user.id,
            role: inv.role,
          },
        });

        await createUserActivity({
          user: inv.User,
          action: 'User.added',
          target: user,
          orgId: inv.orgId,
          tx,
        });
        await tx.invitations.delete({
          where: { id: inv.id },
        });
      });

      res.status(200).send({
        done: true,
      });
    }
  );

  done();
};

export default fn;
