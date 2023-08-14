import type { Prisma, Users, Activities, Revisions } from '@specfy/db';
import type { ActionRevision } from '../activities/types.js';
import type { ApiBlobCreate } from './types.api.js';
export declare function createRevisionActivity({ user, action, target, tx, activityGroupId, }: {
    user: Users;
    action: ActionRevision;
    target: Revisions;
    tx: Prisma.TransactionClient;
    activityGroupId?: string | null;
}): Promise<Activities>;
export declare function createBlobs(blobs: ApiBlobCreate[], tx: Prisma.TransactionClient): Promise<string[]>;
