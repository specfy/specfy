import { envs } from '@specfy/core';
import { logEvent } from '@specfy/events';
import { v1, stripe, betaTrialEnd } from '@specfy/models';
import { z } from 'zod';

import type { PostSubscription } from '@specfy/models';

import { validationError } from '../../../common/errors.js';
import { getOrg } from '../../../middlewares/getOrg.js';
import { noQuery } from '../../../middlewares/noQuery.js';

import type { FastifyPluginCallback } from 'fastify';
import type Stripe from 'stripe';

const keys = Object.values(v1).map((plan) => plan.price.key);
function BodyVal() {
  return z
    .object({
      priceKey: z.enum(keys as [string, ...string[]]),
    })
    .strict();
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post<PostSubscription>(
    '/',
    { preHandler: [noQuery, getOrg] },
    async function (req, res) {
      const org = req.org!;
      const me = req.me!;

      const val = await BodyVal().safeParseAsync(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const billingUrl = `${envs.APP_HOSTNAME}/${org.id}/_/settings/billing`;

      const body = val.data;
      const prices = await stripe.prices.list({
        lookup_keys: [body.priceKey],
        expand: ['data.product'],
      });
      if (prices.data.length !== 1) {
        return res.status(400).send({
          error: {
            code: 'invalid_subscription',
            reason: "The given priceKey wasn't found",
          },
        });
      }

      const trial = Math.round(
        Date.now() + 86400 * 3 * 1000 < betaTrialEnd.getTime()
          ? betaTrialEnd.getTime() / 1000
          : new Date(Date.now() + 86400 * 14 * 1000).getTime() / 1000
      );

      if (org.stripeCustomerId && org.stripeSubscriptionId) {
        const sub = await stripe.subscriptions.retrieve(
          org.stripeSubscriptionId
        );

        if (sub.default_payment_method && sub.items.data.length > 0) {
          // Already have paying customer
          await stripe.subscriptions.update(org.stripeSubscriptionId, {
            cancel_at_period_end: false,
            items: [
              {
                id: sub.items.data[0].id,
                price: prices.data[0].id,
              },
            ],
            trial_end: trial,
          });

          logEvent('stripe.updated', { userId: me.id, orgId: org.id });
          return res.status(200).send({
            data: {
              url: billingUrl,
            },
          });
        }
      }

      const options: Stripe.Checkout.SessionCreateParams = {
        success_url: `${billingUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: billingUrl,
        payment_method_types: ['card'],
        mode: 'subscription',
        billing_address_collection: 'required',
        line_items: [
          {
            price: prices.data[0].id,
            quantity: 1,
          },
        ],
        client_reference_id: org.id,
        allow_promotion_codes: true,
        tax_id_collection: { enabled: true },
        subscription_data: {
          trial_end: trial,
        },
        metadata: {
          // Note: metadata are not persisted correctly https://stackoverflow.com/a/75722808/1163666
          userId: me.id,
          orgId: org.id,
        },
      };
      if (org.stripeCustomerId) {
        options.customer = org.stripeCustomerId;
        options.customer_update = {
          name: 'auto',
          address: 'auto',
          shipping: 'auto',
        };
      }
      const stripeSession = await stripe.checkout.sessions.create(options);

      return res.status(200).send({
        data: {
          url: stripeSession.url!,
        },
      });
    }
  );
  done();
};

export default fn;
