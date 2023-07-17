import type { FastifyPluginCallback } from 'fastify';

import { prisma } from '../../../db/index.js';
import { getRevision } from '../../../middlewares/getRevision.js';
import { toApiRevision } from '../../../models/revisions/formatter.js';
import { toApiUser } from '../../../models/users/formatter.js';
import type { GetRevision } from '../../../types/api/index.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetRevision>(
    '/',
    { preHandler: getRevision },
    async function (req, res) {
      const rev = req.revision!;

      const users = await prisma.typeHasUsers.findMany({
        where: {
          revisionId: rev.id,
        },
        include: { User: true },
      });

      return res.status(200).send({
        data: {
          ...toApiRevision(rev, users),
          reviewers: users
            .filter((user) => user.role === 'reviewer')
            .map((u) => toApiUser(u.User)),
        },
      });
    }
  );
  done();
};

export default fn;
