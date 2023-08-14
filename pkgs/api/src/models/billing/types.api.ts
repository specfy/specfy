import type Stripe from 'stripe';

import type { ApiError, Res } from '../../types/api/index.js';

export type ErrorNoCustomerId = ApiError<'missing_customer_id'>;
export type ErrorMissingSubscription = ApiError<'missing_subscription'>;
export type ErrorInvalidSubscription = ApiError<'invalid_subscription'>;

// GET /stripe/:org_id/subscription
export type GetSubscription = Res<{
  Params: {
    org_id: string;
  };
  Error: ErrorMissingSubscription | ErrorNoCustomerId;
  Success: {
    data: {
      id: string;
      startAt: number;
      endAt: number;
      created: number;
      latestInvoice: string | null;
      status: Stripe.Subscription['status'];
      cancelAt: number | null;
      price: {
        id: string;
        key: string;
      };
      product: {
        id: string;
      };
    };
  };
}>;

// POST /stripe/:org_id/subscription
export type PostSubscription = Res<{
  Params: {
    org_id: string;
  };
  Body: {
    priceKey: string;
  };
  Error: ErrorInvalidSubscription | ErrorNoCustomerId;
  Success: {
    data: {
      url: string;
    };
  };
}>;

// DELETE /stripe/:org_id/subscription
export type CancelSubscription = Res<{
  Params: {
    org_id: string;
  };
  Body: {
    feedback?: string;
    comment?: string;
  };
  Error: ErrorNoCustomerId;
  Success: never;
}>;

// GET /stripe/:org_id/usage
export interface UsageMetric {
  name: string;
  current: number;
  max: number;
  pct: number;
}
export type GetBillingUsage = Res<{
  Params: {
    org_id: string;
  };
  Error: ErrorMissingSubscription;
  Success: {
    data: {
      projects: UsageMetric;
      users: UsageMetric;
      deploy: UsageMetric;
    };
  };
}>;

// POST /stripe/webhooks
export type PostStripeWebhook = Res<{
  Body: any;
  Success: {
    done: true;
  };
}>;
