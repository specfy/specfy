import type { FastifyPluginCallback } from 'fastify';

import { noQuery } from '../../../middlewares/noQuery.js';
import type { GetRoot } from '../../../types/api/root.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetRoot>(
    '/',
    { preHandler: [noQuery] },
    async function (_req, res) {
      return res.status(200).send({
        root: true,
      });
    }
  );
  done();
};

export default fn;
