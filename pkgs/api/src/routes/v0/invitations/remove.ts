import { prisma } from '@specfy/db';
import { checkInheritedPermissions } from '@specfy/models';

import type { DeleteInvitation } from '@specfy/models';

import { forbidden, notFound } from '../../../common/errors.js';
import { noBody } from '../../../middlewares/noBody.js';
import { noQuery } from '../../../middlewares/noQuery.js';

import type { FastifyPluginCallback } from 'fastify';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.delete<DeleteInvitation>(
    '/',
    { preHandler: [noBody, noQuery] },
    async function (req, res) {
      const invitation = await prisma.invitations.findFirst({
        where: { id: req.params.invitation_id },
        include: {
          Org: true,
          User: true,
        },
      });

      if (!invitation) {
        return notFound(res);
      }

      // Check that we have the permissions to delete on this org
      if (!checkInheritedPermissions(req.perms!, 'owner', invitation.orgId)) {
        return forbidden(res);
      }

      await prisma.invitations.delete({
        where: { id: invitation.id },
      });

      return res.status(204).send();
    }
  );
  done();
};

export default fn;
