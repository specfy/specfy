import { envs, l, logEvent, sentry } from '@specfy/core';
import { prisma } from '@specfy/db';
import { v1, stripe } from '@specfy/models';

import type { PostStripeWebhook } from '@specfy/models';

import { forbidden } from '../../../common/errors.js';
import { noQuery } from '../../../middlewares/noQuery.js';

import type { FastifyPluginCallback } from 'fastify';
import type Stripe from 'stripe';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post<PostStripeWebhook>(
    '/',
    {
      preHandler: [noQuery],
      config: {
        // @ts-expect-error TODO: remove this after 8.0.4 is released
        rateLimit: false,
        rawBody: true,
      },
    },
    async function (req, res) {
      const sig = req.headers['stripe-signature'];
      if (!sig || typeof sig !== 'string') {
        console.error('[hook] No signature');
        return forbidden(res);
      }

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(
          req.rawBody!,
          sig,
          envs.STRIPE_WEBHOOKS_SECRET || ''
        );
      } catch (err) {
        console.error('[stripe-hook] Signature does not match');
        sentry.captureException(err);
        return forbidden(res);
      }

      l.info('[stripe-hook]', event.type);

      /**
       * Please note the field `Metadata` is not persisted on every webhook
       * It should not be a reliable source of data.
       */

      if (event.type === 'checkout.session.completed') {
        // A customer completed their first checkout
        // We need to register the customerId and subscriptionId
        const data = event.data.object as Stripe.Checkout.Session;

        await prisma.orgs.update({
          where: {
            id: data.metadata!.orgId,
          },
          data: {
            stripeSubscriptionId: data.subscription as string,
            stripeCustomerId: data.customer as string,
          },
        });

        await stripe.subscriptions.update(data.subscription as string, {
          metadata: data.metadata,
        });

        const subscriptions = await stripe.subscriptions.list({
          customer: data.customer as string,
          status: 'active',
        });

        // When we checkout the first time I didn't find a way to replace the free plan by the new plan
        // Maybe a way would be to do it in two step by asking for the credit card and updating the sub instead of triggering a checkout session
        // So we need to clean the free plan manually
        if (subscriptions.data.length > 1) {
          const freePlanId = v1.free.id;
          for (const sub of subscriptions.data) {
            const price = sub.items.data[0].price;
            if (price.product !== freePlanId) {
              continue;
            }

            await stripe.subscriptions.cancel(sub.id);
          }
        }

        logEvent('stripe.subscribed', { orgId: data.metadata!.orgId });
        return res.status(200).send({
          done: true,
        });
      }

      if (event.type === 'invoice.payment_succeeded') {
        const data = event.data.object as Stripe.Invoice;

        if (data['billing_reason'] == 'subscription_create') {
          const subscriptionId = data['subscription'] as string;
          const paymentIntentId = data['payment_intent'] as string;
          if (!paymentIntentId) {
            // Free plan
            return;
          }
          const paymentIntent = await stripe.paymentIntents.retrieve(
            paymentIntentId
          );

          await stripe.subscriptions.update(subscriptionId, {
            default_payment_method: paymentIntent.payment_method as string,
          });
        }

        return res.status(200).send({
          done: true,
        });
      }

      if (
        event.type === 'customer.subscription.updated' ||
        event.type === 'customer.subscription.created'
      ) {
        // A customer completed their first checkout
        // We need to register the customerId and subscriptionId
        const data = event.data.object as Stripe.Subscription;
        const price = data.items.data[0].price;

        await prisma.orgs.updateMany({
          where: {
            stripeCustomerId: data.customer as string,
          },
          data: {
            stripeSubscriptionId: data.id,
            stripePriceId: price.id,
            currentPlanId: price.product as string,
            stripeCurrentPeriodStart: new Date(
              data.current_period_start * 1000
            ),
            stripeCurrentPeriodEnd: new Date(data.current_period_end * 1000),
          },
        });

        return res.status(200).send({
          done: true,
        });
      }

      if (event.type === 'customer.subscription.deleted') {
        const data = event.data.object as Stripe.Subscription;

        const orgs = await prisma.$transaction(async (tx) => {
          const list = await tx.orgs.findMany({
            where: {
              stripeSubscriptionId: data.id,
            },
          });
          await tx.orgs.updateMany({
            where: {
              stripeSubscriptionId: data.id,
            },
            data: {
              stripePriceId: null,
              stripeSubscriptionId: null,
              currentPlanId: null,
              stripeCurrentPeriodStart: null,
              stripeCurrentPeriodEnd: null,
            },
          });
          return list;
        });

        for (const org of orgs) {
          logEvent('stripe.deleted', { orgId: org.id });
        }
        return res.status(200).send({
          done: true,
        });
      }

      return res.status(200).send({
        done: true,
      });
    }
  );
  done();
};

export default fn;
