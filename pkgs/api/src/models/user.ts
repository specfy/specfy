import type { Activities, Prisma, Users } from '@prisma/client';
import JWT from 'jsonwebtoken';

import { JWT_SECRET } from '../common/auth';
import { nanoid } from '../common/id';
import type { ActionUser } from '../types/db';

export function getJwtToken(user: Users, expiresAt?: Date): string {
  return JWT.sign(
    {
      id: user.id,
      expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
      type: 'session',
    },
    JWT_SECRET
  );
}

export async function createUserActivity({
  user,
  action,
  target,
  orgId,
  tx,
  activityGroupId = null,
}: {
  user: Users;
  action: ActionUser;
  target: Users;
  orgId: string | null;
  tx: Prisma.TransactionClient;
  activityGroupId?: string | null;
}): Promise<Activities> {
  return await tx.activities.create({
    data: {
      id: nanoid(),
      action,
      userId: user.id,
      orgId: orgId,
      projectId: null,
      activityGroupId,
      targetUserId: target.id,
      createdAt: new Date(),
    },
  });
}
