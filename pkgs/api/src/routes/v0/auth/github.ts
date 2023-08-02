import type { FastifyPluginCallback } from 'fastify';

import { envs } from '../../../common/env.js';
import { fastifyPassport } from '../../../middlewares/auth/index.js';
import { noQuery } from '../../../middlewares/noQuery.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get(
    '/github',
    {
      preHandler: [noQuery, fastifyPassport.authenticate('github')],
    },
    function (_req, res) {
      // nothing todo
      return res.status(403);
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
            window.opener.postMessage("installation.done", "${envs.APP_HOSTNAME}");
          });
        </script>
      </body>`);
        return;
      }

      return res.redirect(envs.APP_HOSTNAME);
    }
  );
  done();
};

export default fn;
