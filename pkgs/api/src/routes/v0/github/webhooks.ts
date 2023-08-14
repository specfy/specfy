import type {
  WebhookEventMap,
  WebhookEventName,
} from '@octokit/webhooks-types';
import { webhookService } from '@specfy/github';
import type { PostGithubWebhook } from '@specfy/models';
import type { FastifyPluginCallback } from 'fastify';

import { forbidden } from '../../../common/errors.js';
import { noQuery } from '../../../middlewares/noQuery.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post<PostGithubWebhook>(
    '/',
    {
      preHandler: [noQuery],
      config: {
        // @ts-expect-error TODO: remove this after 8.0.4 is released
        rateLimit: false,
      },
    },
    async function (req, res) {
      const id = req.headers['x-github-delivery'];
      if (!id || typeof id !== 'string') {
        console.error('[hook] No id');
        return forbidden(res);
      }

      const name = req.headers['x-github-event'] as WebhookEventName;
      if (!name || typeof name !== 'string') {
        console.error('[hook] No name');
        return forbidden(res);
      }

      const sig = req.headers['x-hub-signature-256'];
      if (!sig || typeof sig !== 'string') {
        console.error('[hook] No hub signature');
        return forbidden(res);
      }

      const payload = req.body as WebhookEventMap[typeof name];
      const valid = await webhookService.verify(JSON.stringify(payload), sig);

      if (!valid) {
        console.error('[hook] Signature does not match');
        return forbidden(res);
      }

      void webhookService.receive({
        id,
        name: name as any,
        payload: payload as any,
      });

      return res.status(200).send({
        done: true,
      });
    }
  );
  done();
};

export default fn;
