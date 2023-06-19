import type {
  WebhookEventMap,
  WebhookEventName,
} from '@octokit/webhooks-types';
import type { FastifyPluginCallback } from 'fastify';

import { forbidden } from '../../../common/errors';
import { noQuery } from '../../../middlewares/noQuery';
import { webhookService } from '../../../services/github';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{ Reply: any; Body: any }>(
    '/',
    { preHandler: [noQuery] },
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

      webhookService.receive({
        id,
        name: name as any,
        payload: payload as any,
      });

      res.status(200).send({
        done: true,
      });
    }
  );

  done();
};

export default fn;
