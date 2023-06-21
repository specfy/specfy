import type { FastifyPluginCallback } from 'fastify';

import { forbidden } from '../../../common/errors';
import { toApiOrg } from '../../../common/formatters/org';
import { toApiUser } from '../../../common/formatters/user';
import { getInvitation } from '../../../middlewares/getInvitation';
import { noBody } from '../../../middlewares/noBody';
import type { GetInvitation } from '../../../types/api';
import type { PermType } from '../../../types/db';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<GetInvitation>(
    '/',
    { preHandler: [noBody, getInvitation] },
    async function (req, res) {
      const inv = req.invitation!;
      const user = req.user!;

      if (user.email !== inv.email) {
        return forbidden(res);
      }

      res.status(200).send({
        data: {
          id: inv.id,
          email: inv.email,
          userId: inv.userId,
          orgId: inv.orgId,
          role: inv.role as PermType,
          by: toApiUser(inv.User),
          org: toApiOrg(inv.Org),
          createdAt: inv.createdAt,
          expiresAt: inv.expiresAt,
        },
      });
    }
  );

  done();
};

export default fn;
