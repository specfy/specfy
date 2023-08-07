import type { FastifyPluginCallback } from 'fastify';

import { noQuery } from '../../../middlewares/noQuery.js';
import { toApiMe } from '../../../models/users/formatter.js';
import type { GetMe } from '../../../types/api/index.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetMe>('/', { preHandler: [noQuery] }, async function (req, res) {
    const user = req.me!;

    return res.status(200).send({
      data: toApiMe(user, req.perms!),
    });
  });
  done();
};

export default fn;
