import type { FastifyPluginCallback } from 'fastify';

import { forbidden } from '../../../common/errors.js';
import { getInvitation } from '../../../middlewares/getInvitation.js';
import { noBody } from '../../../middlewares/noBody.js';
import { toApiOrg } from '../../../models/org/formatter.js';
import { toApiUser } from '../../../models/user/formatter.js';
import type { GetInvitation } from '../../../types/api/index.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetInvitation>(
    '/',
    { preHandler: [noBody, getInvitation] },
    async function (req, res) {
      const inv = req.invitation!;
      const user = req.user!;

      if (user.email !== inv.email) {
        return forbidden(res);
      }

      return res.status(200).send({
        data: {
          id: inv.id,
          email: inv.email,
          userId: inv.userId,
          orgId: inv.orgId,
          role: inv.role,
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
