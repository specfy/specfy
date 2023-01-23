import type { FastifyPluginCallback } from 'fastify';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get('/me', async function () {
    return { root: false };
  });

  done();
};

export default fn;
