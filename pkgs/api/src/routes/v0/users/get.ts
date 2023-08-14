import { toApiUserPublic } from '@specfy/models';
import type { GetUser } from '@specfy/models';
import type { FastifyPluginCallback } from 'fastify';

import { getUser } from '../../../middlewares/getUser.js';
import { noQuery } from '../../../middlewares/noQuery.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetUser>(
    '/',
    { preHandler: [noQuery, getUser] },
    async function (req, res) {
      // TODO: enforce orgId relationship, right now it's possible to list all users but it's not critical due to ID being random
      return res.status(200).send({
        data: toApiUserPublic(req.user!),
      });
    }
  );
  done();
};

export default fn;
