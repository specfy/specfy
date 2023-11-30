import { nanoid } from '@specfy/core';
import { prisma } from '@specfy/db';
import { logEvent } from '@specfy/events';
import { createUserActivity } from '@specfy/models';

import type { AcceptInvitation } from '@specfy/models';

import { forbidden } from '../../../common/errors.js';
import { getInvitation } from '../../../middlewares/getInvitation.js';
import { noBody } from '../../../middlewares/noBody.js';

import type { FastifyPluginCallback } from 'fastify';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post<AcceptInvitation>(
    '/',
    { preHandler: [noBody, getInvitation] },
    async function (req, res) {
      const inv = req.invitation!;
      const me = req.me!;

      if (me.email !== inv.email) {
        return forbidden(res);
      }

      await prisma.$transaction(async (tx) => {
        await tx.perms.create({
          data: {
            id: nanoid(),
            orgId: inv.orgId,
            projectId: null,
            userId: me.id,
            role: inv.role,
          },
        });

        await createUserActivity({
          user: inv.User,
          action: 'User.added',
          target: me,
          orgId: inv.orgId,
          tx,
        });
        await tx.invitations.delete({
          where: { id: inv.id },
        });
      });

      logEvent('invitation.accepted', { userId: me.id, orgId: inv.orgId });

      return res.status(200).send({
        done: true,
      });
    }
  );
  done();
};

export default fn;
