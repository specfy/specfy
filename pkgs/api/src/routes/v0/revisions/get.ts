import { toApiRevision, toApiUser } from '@specfy/models';
import type { GetRevision } from '@specfy/models';
import type { FastifyPluginCallback } from 'fastify';

import { getRevision } from '../../../middlewares/getRevision.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetRevision>(
    '/',
    { preHandler: getRevision },
    async function (req, res) {
      const rev = req.revision!;

      return res.status(200).send({
        data: {
          ...toApiRevision(rev),
          reviewers: rev.TypeHasUsers.filter(
            (user) => user.role === 'reviewer'
          ).map((u) => toApiUser(u.User)),
        },
      });
    }
  );
  done();
};

export default fn;
