import type { FastifyPluginCallback } from 'fastify';

import type { ResListOrgs } from '../../../types/api/orgs';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{ Reply: ResListOrgs }>('/', async function (_req, res) {
    res.status(200).send({
      data: [
        {
          id: 'samuelbodin',
          name: "Samuel Bodin's org",
        },
        {
          id: 'algolia',
          name: 'Algolia',
        },
      ],
    });
  });

  done();
};

export default fn;
