import type { FastifyPluginCallback } from 'fastify';

import { fastifyPassport } from '../../../middlewares/auth';
import { noQuery } from '../../../middlewares/noQuery';
import { getJwtToken } from '../../../models';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get(
    '/github',
    {
      preHandler: [
        noQuery,
        fastifyPassport.authenticate('github', { scope: ['user:email'] }),
      ],
    },
    function (_req, res) {
      // nothing todo
      res.status(403);
    }
  );

  fastify.get<{ Reply: any }>(
    '/github/cb',
    { preValidation: [fastifyPassport.authenticate('github')] },
    function (req, res) {
      res.status(200).send({
        token: getJwtToken(req.user!),
      });
    }
  );

  done();
};

export default fn;
