import type { FastifyPluginCallback } from 'fastify';

import { toApiMe } from '../../../common/formatters/user.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import type { GetMe } from '../../../types/api/index.js';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<GetMe>('/', { preHandler: [noQuery] }, async function (req, res) {
    const user = req.user!;

    res.status(200).send({
      data: toApiMe(user),
    });
  });

  done();
};

export default fn;
