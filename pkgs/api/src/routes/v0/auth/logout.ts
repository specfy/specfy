import { noBody } from '../../../middlewares/noBody.js';
import { noQuery } from '../../../middlewares/noQuery.js';

import type { PostLogout } from '../../../types/api/auth.js';
import type { FastifyPluginCallback } from 'fastify';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post<PostLogout>(
    '/logout',
    { preHandler: [noQuery, noBody] },
    async function (req, res) {
      await req.logOut();
      // nothing todo
      return res.status(204).send();
    }
  );
  done();
};

export default fn;
