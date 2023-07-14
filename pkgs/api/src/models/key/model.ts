import type { Activities, Keys, Prisma, Users } from '@prisma/client';

import { nanoid } from '../../common/id.js';
import type { ActionKey } from '../../types/db/index.js';

export async function createKey({
  tx,
  user,
  data,
  activityGroupId = null,
}: {
  tx: Prisma.TransactionClient;
  user: Users;
  data: Omit<Prisma.KeysUncheckedCreateInput, 'id' | 'userId'>;
  activityGroupId?: string | null;
}): Promise<Keys> {
  const id = `spfy_${nanoid(24)}`;
  const tmp = await tx.keys.create({
    data: {
      ...data,
      userId: user.id,
      id,
    },
  });
  await createKeyActivity({
    user,
    action: 'Key.created',
    target: tmp,
    tx,
    activityGroupId,
  });

  return tmp;
}

export async function createKeyActivity({
  user,
  action,
  target,
  tx,
  activityGroupId = null,
}: {
  user: Users;
  action: ActionKey;
  target: Keys;
  tx: Prisma.TransactionClient;
  activityGroupId?: string | null;
}): Promise<Activities> {
  return await tx.activities.create({
    data: {
      id: nanoid(),
      action,
      userId: user.id,
      orgId: target.orgId,
      projectId: target.projectId,
      activityGroupId,
      createdAt: new Date(),
    },
  });
}
