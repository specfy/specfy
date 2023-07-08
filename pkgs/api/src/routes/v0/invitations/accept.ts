import type { FastifyPluginCallback } from 'fastify';

import { forbidden } from '../../../common/errors.js';
import { nanoid } from '../../../common/id.js';
import { prisma } from '../../../db/index.js';
import { getInvitation } from '../../../middlewares/getInvitation.js';
import { noBody } from '../../../middlewares/noBody.js';
import { createUserActivity } from '../../../models/index.js';
import type { AcceptInvitation } from '../../../types/api/index.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
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

      return res.status(200).send({
        done: true,
      });
    }
  );
  done();
};

export default fn;
