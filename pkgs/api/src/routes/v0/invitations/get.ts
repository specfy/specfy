import type { FastifyPluginCallback } from 'fastify';

import { forbidden } from '../../../common/errors.js';
import { toApiOrg } from '../../../common/formatters/org.js';
import { toApiUser } from '../../../common/formatters/user.js';
import { getInvitation } from '../../../middlewares/getInvitation.js';
import { noBody } from '../../../middlewares/noBody.js';
import type { GetInvitation } from '../../../types/api/index.js';
import type { PermType } from '../../../types/db/index.js';

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
