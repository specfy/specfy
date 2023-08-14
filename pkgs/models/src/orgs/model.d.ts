import type { Activities, Orgs, Prisma, Users } from '@specfy/db';
import type { ActionOrg } from '../activities/types.js';
export type { Orgs } from '@specfy/db';
export declare function createOrg(tx: Prisma.TransactionClient, user: Users, data: Omit<Prisma.OrgsUncheckedCreateInput, 'acronym' | 'color' | 'currentPlanId' | 'stripeCurrentPeriodEnd' | 'stripeCurrentPeriodStart'>): Promise<Orgs>;
export declare function createOrgActivity({ user, action, target, tx, activityGroupId, }: {
    user: Users;
    action: ActionOrg;
    target: Orgs;
    tx: Prisma.TransactionClient;
    activityGroupId?: string | null;
}): Promise<Activities>;
