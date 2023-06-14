import type { FastifyPluginCallback } from 'fastify';

import { env } from '../../../common/env';
import { fastifyPassport } from '../../../middlewares/auth';
import { noQuery } from '../../../middlewares/noQuery';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get(
    '/github',
    {
      preHandler: [noQuery, fastifyPassport.authenticate('github')],
    },
    function (_req, res) {
      // nothing todo
      res.status(403);
    }
  );

  fastify.get<{ Reply: any; Querystring: { installation_id: number } }>(
    '/github/cb',
    { preValidation: [fastifyPassport.authenticate('github')] },
    function (req, res) {
      if (req.query.installation_id) {
        res.status(200).send('Redirecting...');
        return;
      }

      res.redirect(env('APP_HOSTNAME')!);
    }
  );

  done();
};

export default fn;
