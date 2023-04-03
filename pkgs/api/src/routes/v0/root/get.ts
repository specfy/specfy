import type { FastifyPluginCallback } from 'fastify';

import { noQuery } from '../../../middlewares/noQuery';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get('/', { preHandler: [noQuery] }, async function (_req, res) {
    res.status(200).send({
      root: true,
    });
  });

  done();
};

export default fn;
