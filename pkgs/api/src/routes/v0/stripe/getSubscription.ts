import type { FastifyPluginCallback } from 'fastify';

import { getOrg } from '../../../middlewares/getOrg.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import { stripe } from '../../../models/billing/stripe.js';
import type { GetSubscription } from '../../../types/api/index.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetSubscription>(
    '/',
    { preHandler: [noQuery, getOrg] },
    async function (req, res) {
      const org = req.org!;

      if (!org.stripeCustomerId) {
        return res.status(400).send({
          error: {
            code: 'missing_customer_id',
            reason: 'Missing customer ID in the backend',
          },
        });
      }

      const subscriptions = await stripe.subscriptions.list({
        customer: org.stripeCustomerId,
        status: 'active',
      });

      if (subscriptions.data.length !== 1) {
        return res.status(400).send({
          error: {
            code: 'missing_subscription',
            reason: 'Customer has no valid subscription',
          },
        });
      }

      const sub = subscriptions.data[0];
      const price = sub.items.data[0].price;
      return res.status(200).send({
        data: {
          id: sub.id,
          startAt: sub.current_period_start,
          endAt: sub.current_period_end,
          created: sub.created,
          latestInvoice:
            typeof sub.latest_invoice === 'string' ? sub.latest_invoice : null,
          status: sub.status,
          cancelAt: sub.cancel_at,
          price: {
            id: price.id,
            key: price.lookup_key!,
          },
          product: {
            id: price.product as string,
          },
        },
      });
    }
  );
  done();
};

export default fn;
