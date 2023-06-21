import type { FastifyPluginCallback } from 'fastify';

import { forbidden, notFound } from '../../../common/errors';
import { prisma } from '../../../db';
import { noBody } from '../../../middlewares/noBody';
import { noQuery } from '../../../middlewares/noQuery';
import type { DeleteInvitation } from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
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
      if (
        !req.perms!.find(
          (perm) => perm.orgId === invitation.orgId && perm.projectId === null
        )
      ) {
        return forbidden(res);
      }

      await prisma.invitations.delete({
        where: { id: invitation.id },
      });

      res.status(204).send();
    }
  );

  done();
};

export default fn;
