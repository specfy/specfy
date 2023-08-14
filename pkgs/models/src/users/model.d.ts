import type { Activities, Prisma, Users } from '@specfy/db';
import type { ActionUser } from '../activities/types.js';
export type { Users } from '@specfy/db';
export declare function getJwtToken(user: Users, expiresAt?: Date): string;
export declare function createUserActivity({ user, action, target, orgId, tx, activityGroupId, }: {
    user: Users;
    action: ActionUser;
    target: Users;
    orgId: string | null;
    tx: Prisma.TransactionClient;
    activityGroupId?: string | null;
}): Promise<Activities>;
export declare const userGithubApp: Users;
