import type { FastifyPluginCallback } from 'fastify';

import { forbidden, notFound } from '../../../common/errors.js';
import { prisma } from '../../../db/index.js';
import { noBody } from '../../../middlewares/noBody.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import { checkInheritedPermissions } from '../../../models/perms/helpers.js';
import type { DeleteInvitation } from '../../../types/api/index.js';

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
