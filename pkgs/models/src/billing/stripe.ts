import { envs } from '@specfy/core';
import Stripe from 'stripe';

export const stripe = new Stripe(envs.STRIPE_KEY, {
  apiVersion: '2022-11-15',
  typescript: true,
  telemetry: false,
});
