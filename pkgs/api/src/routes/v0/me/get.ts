import type { FastifyPluginCallback } from 'fastify';

import { toApiMe } from '../../../common/formatters/user';
import { noQuery } from '../../../middlewares/noQuery';
import type { GetMe } from '../../../types/api';

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
