import type { Activities, Keys, Prisma, Users } from '@prisma/client';

import { nanoid } from '../common/id';
import type { ActionKey } from '../types/db';

export async function createKey(
  tx: Prisma.TransactionClient,
  user: Users,
  data: Omit<Prisma.KeysUncheckedCreateInput, 'id' | 'userId'>
): Promise<Keys> {
  const id = `spfy_${nanoid(24)}`;
  const tmp = await tx.keys.create({
    data: {
      ...data,
      userId: user.id,
      id,
    },
  });
  await createKeyActivity(user, 'Key.created', tmp, tx);

  return tmp;
}

export async function createKeyActivity(
  user: Users,
  action: ActionKey,
  target: Keys,
  tx: Prisma.TransactionClient
): Promise<Activities> {
  const activityGroupId = nanoid();

  return await tx.activities.create({
    data: {
      id: nanoid(),
      action,
      userId: user.id,
      orgId: target.orgId,
      projectId: target.projectId,
      activityGroupId,
    },
  });
}
