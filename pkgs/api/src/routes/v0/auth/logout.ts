import type { FastifyPluginCallback } from 'fastify';

import { noBody } from '../../../middlewares/noBody';
import { noQuery } from '../../../middlewares/noQuery';
import type { PostLogout } from '../../../types/api/auth';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<PostLogout>(
    '/logout',
    { preHandler: [noQuery, noBody] },
    async function (req, res) {
      await req.logOut();
      // nothing todo
      res.status(204).send();
    }
  );

  done();
};

export default fn;
