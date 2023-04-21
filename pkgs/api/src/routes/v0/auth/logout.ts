import type { FastifyPluginCallback } from 'fastify';

import { noBody } from '../../../middlewares/noBody';
import { noQuery } from '../../../middlewares/noQuery';
import type { ResPostLogoutSuccess } from '../../../types/api/auth';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{
    Reply: ResPostLogoutSuccess;
  }>('/logout', { preHandler: [noQuery, noBody] }, async function (req, res) {
    await req.logOut();
    // nothing todo
    res.status(204).send();
  });

  done();
};

export default fn;
