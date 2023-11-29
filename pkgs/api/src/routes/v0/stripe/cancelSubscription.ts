import { logEvent } from '@specfy/events';
import { stripe } from '@specfy/models';
import { z } from 'zod';

import type { CancelSubscription } from '@specfy/models';

import { validationError } from '../../../common/errors.js';
import { getOrg } from '../../../middlewares/getOrg.js';
import { noQuery } from '../../../middlewares/noQuery.js';

import type { FastifyPluginCallback } from 'fastify';

function BodyVal() {
  return z
    .object({
      comment: z.string().optional(),
      feedback: z
        .enum([
          'customer_service',
          'low_quality',
          'missing_features',
          'other',
          'switched_service',
          'too_complex',
          'too_expensive',
          'unused',
        ])
        .optional(),
    })
    .strict();
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.delete<CancelSubscription>(
    '/',
    { preHandler: [noQuery, getOrg] },
    async function (req, res) {
      const val = await BodyVal().safeParseAsync(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const me = req.me!;
      const org = req.org!;
      const data = val.data;

      if (!org.stripeCustomerId || !org.stripeSubscriptionId) {
        return res.status(400).send({
          error: {
            code: 'missing_customer_id',
            reason: 'Missing customer ID in the backend',
          },
        });
      }

      await stripe.subscriptions.update(org.stripeSubscriptionId, {
        cancel_at_period_end: true,
        cancellation_details: {
          comment: data.comment || '',
          feedback: data.feedback || 'other',
        },
      });

      logEvent('stripe.cancel', { userId: me.id, orgId: org.id });
      return res.status(204).send();
    }
  );
  done();
};

export default fn;
