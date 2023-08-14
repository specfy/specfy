import type { GetFlow } from '@specfy/models';
import type { FastifyPluginCallback } from 'fastify';

import { getFlow } from '../../../middlewares/getFlow.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetFlow>(
    '/',
    { preHandler: [getFlow] },
    async function (req, res) {
      const flow = req.flow!;

      return res.status(200).send({
        data: {
          id: flow.id,
          flow: flow.flow,
          createdAt: flow.createdAt.toISOString(),
          updatedAt: flow.createdAt.toISOString(),
        },
      });
    }
  );
  done();
};

export default fn;
