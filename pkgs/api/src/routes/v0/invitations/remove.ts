import type { FastifyPluginCallback } from 'fastify';

import { forbidden } from '../../../common/errors';
import { prisma } from '../../../db';
import { getInvitation } from '../../../middlewares/getInvitation';
import { noBody } from '../../../middlewares/noBody';
import type {
  ReqGetInvitation,
  ReqInvitationParams,
  ResDeleteInvitation,
} from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.delete<{
    Params: ReqInvitationParams;
    Querystring: ReqGetInvitation;
    Reply: ResDeleteInvitation;
  }>('/', { preHandler: [noBody, getInvitation] }, async function (req, res) {
    const inv = req.invitation!;
    const user = req.user!;

    if (user.email !== inv.email) {
      // Check that we have the permissions to delete on this org
      if (
        !req.perms!.find(
          (perm) => perm.orgId === inv.orgId && perm.projectId === null
        )
      ) {
        return forbidden(res);
      }
    }

    await prisma.invitations.delete({
      where: { id: inv.id },
    });

    res.status(204).send();
  });

  done();
};

export default fn;
