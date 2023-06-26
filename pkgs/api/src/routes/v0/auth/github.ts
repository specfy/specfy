import type { FastifyPluginCallback } from 'fastify';

import { env } from '../../../common/env.js';
import { fastifyPassport } from '../../../middlewares/auth/index.js';
import { noQuery } from '../../../middlewares/noQuery.js';

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
        res.status(200).type('text/html').send(`<html><body>
        Redirecting...
        <script>
          document.addEventListener("DOMContentLoaded", function() {
            //JSON data for message
            window.opener.postMessage("installation.done", "${env(
              'APP_HOSTNAME'
            )}");
          });
        </script>
      </body>`);
        return;
      }

      res.redirect(env('APP_HOSTNAME')!);
    }
  );

  done();
};

export default fn;
