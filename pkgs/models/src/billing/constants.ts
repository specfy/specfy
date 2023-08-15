import { envs } from '@specfy/core';

export const BILLING_ENABLED = envs.STRIPE_KEY !== '' && !process.env.CI;
