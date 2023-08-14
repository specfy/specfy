import Stripe from 'stripe';

import { envs } from '../../common/env.js';

export const stripe = new Stripe(envs.STRIPE_KEY, {
  apiVersion: '2022-11-15',
  typescript: true,
  telemetry: false,
});
