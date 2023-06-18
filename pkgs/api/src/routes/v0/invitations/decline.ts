import type { FastifyPluginCallback } from 'fastify';

import { forbidden } from '../../../common/errors';
import { prisma } from '../../../db';
import { getInvitation } from '../../../middlewares/getInvitation';
import { noBody } from '../../../middlewares/noBody';
import type {
  ReqGetInvitation,
  ReqInvitationParams,
  ResDeclineInvitation,
} from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{
    Params: ReqInvitationParams;
    Querystring: ReqGetInvitation;
    Reply: ResDeclineInvitation;
  }>('/', { preHandler: [noBody, getInvitation] }, async function (req, res) {
    const inv = req.invitation!;
    const user = req.user!;

    if (user.email !== inv.email) {
      return forbidden(res);
    }

    await prisma.invitations.delete({
      where: { id: inv.id },
    });

    res.status(200).send({
      done: true,
    });
  });

  done();
};

export default fn;
