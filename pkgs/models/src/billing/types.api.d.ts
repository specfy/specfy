import type { ApiError, Res } from '@specfy/core';
import type Stripe from 'stripe';
export type ErrorNoCustomerId = ApiError<'missing_customer_id'>;
export type ErrorMissingSubscription = ApiError<'missing_subscription'>;
export type ErrorInvalidSubscription = ApiError<'invalid_subscription'>;
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
export type PostStripeWebhook = Res<{
    Body: any;
    Success: {
        done: true;
    };
}>;
