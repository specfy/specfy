import type { Activities, Keys, Prisma, Users } from '@specfy/db';
import type { ActionKey } from '../activities/types.js';
export declare function createKey({ tx, user, data, activityGroupId, }: {
    tx: Prisma.TransactionClient;
    user: Users;
    data: Omit<Prisma.KeysUncheckedCreateInput, 'id' | 'userId'>;
    activityGroupId?: string | null;
}): Promise<Keys>;
export declare function createKeyActivity({ user, action, target, tx, activityGroupId, }: {
    user: Users;
    action: ActionKey;
    target: Keys;
    tx: Prisma.TransactionClient;
    activityGroupId?: string | null;
}): Promise<Activities>;
