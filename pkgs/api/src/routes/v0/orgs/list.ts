import type { FastifyPluginCallback } from 'fastify';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get('/', async function () {
    return {
      data: [
        {
          id: 'samuelbodin',
          name: "Samuel Bodin's org",
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
        {
          id: 'algolia',
          name: 'Algolia',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
      ],
    };
  });

  done();
};

export default fn;
