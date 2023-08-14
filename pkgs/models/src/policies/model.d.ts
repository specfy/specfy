import type { Policies, Users, Prisma, Activities } from '@specfy/db';
import type { ActionPolicy } from '../activities/types.js';
export declare function createPoliciesActivity({ user, action, target, tx, activityGroupId, }: {
    user: Users;
    action: ActionPolicy;
    target: Policies;
    tx: Prisma.TransactionClient;
    activityGroupId?: string | null;
}): Promise<Activities>;
