import type { FastifyPluginCallback } from 'fastify';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get('/me', async function () {
    return {
      id: '1',
      name: 'Samuel Bodin',
      email: 'bodin.samuel@gmail.com',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };
  });

  done();
};

export default fn;
