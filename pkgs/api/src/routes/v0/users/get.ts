import type { FastifyPluginCallback } from 'fastify';

import { getUser } from '../../../middlewares/getUser.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import { toApiUserPublic } from '../../../models/users/formatter.js';
import type { GetUser } from '../../../types/api/index.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetUser>(
    '/',
    { preHandler: [noQuery, getUser] },
    async function (req, res) {
      return res.status(200).send({
        data: toApiUserPublic(req.user!),
      });
    }
  );
  done();
};

export default fn;
