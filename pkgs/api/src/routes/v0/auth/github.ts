import { envs } from '@specfy/core';
import type { FastifyPluginCallback } from 'fastify';

import { fastifyPassport } from '../../../middlewares/auth/index.js';
import { noQuery } from '../../../middlewares/noQuery.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get(
    '/github',
    {
      preHandler: [noQuery, fastifyPassport.authenticate('github')],
      config: {
        rateLimit: {
          max: 25,
        },
      },
    },
    function (_req, res) {
      // nothing todo
      return res.status(403);
    }
  );

  fastify.get<{ Reply: any; Querystring: { installation_id: number } }>(
    '/github/cb',
    {
      preValidation: [
        fastifyPassport.authenticate('github', async (_req, res, err) => {
          if (err) {
            // When people are modifiying the GitHub permissions directly in GitHub it redirects here
            // But sometimes the token is invalid or what not so better be sure to redirect them instead of getting a 500
            res.redirect(`${envs.APP_HOSTNAME}?err`);
            return;
          }
        }),
      ],
      config: {
        rateLimit: {
          max: 25,
        },
      },
    },
    (req, res) => {
      if (req.query.installation_id) {
        res.status(200).type('text/html').send(`<html><body>
        Redirecting...
        <script>
          document.addEventListener("DOMContentLoaded", function() {
            if (window.opener) {
              //JSON data for message
              window.opener.postMessage("installation.done", "${envs.APP_HOSTNAME}");
            } else {
              window.location.href = "${envs.APP_HOSTNAME}"
            }
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
