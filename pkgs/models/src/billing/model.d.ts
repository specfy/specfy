import type { Users, Orgs } from '@specfy/db';
import type { GetBillingUsage } from './types.api.js';
export declare function getUsage(org: Orgs): Promise<GetBillingUsage['Success']['data']>;
export declare function createFreeSubscription({ org, me, }: {
    org: Orgs;
    me: Users;
}): Promise<{
    id: string;
    createdAt: Date;
    name: string;
    updatedAt: Date;
    avatarUrl: string | null;
    flowId: string | null;
    color: string;
    acronym: string;
    githubInstallationId: number | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    stripePriceId: string | null;
    stripeCurrentPeriodStart: Date | null;
    stripeCurrentPeriodEnd: Date | null;
    currentPlanId: string | null;
} | undefined>;
