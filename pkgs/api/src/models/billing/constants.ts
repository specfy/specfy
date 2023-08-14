import { envs } from '../../common/env.js';

export const BILLING_ENABLED = envs.STRIPE_KEY !== '' && !process.env.CI;

console.log('key', envs.STRIPE_KEY, BILLING_ENABLED);
