import type { FastifyPluginCallback } from 'fastify';

import { forbidden } from '../../../common/errors.js';
import { prisma } from '../../../db/index.js';
import { getInvitation } from '../../../middlewares/getInvitation.js';
import { noBody } from '../../../middlewares/noBody.js';
import type { DeclineInvitation } from '../../../types/api/index.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post<DeclineInvitation>(
    '/',
    { preHandler: [noBody, getInvitation] },
    async function (req, res) {
      const inv = req.invitation!;
      const user = req.user!;

      if (user.email !== inv.email) {
        return forbidden(res);
      }

      await prisma.invitations.delete({
        where: { id: inv.id },
      });

      return res.status(200).send({
        done: true,
      });
    }
  );

  done();
};

export default fn;
