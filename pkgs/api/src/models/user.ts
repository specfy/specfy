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

export async function createUserActivity(
  user: Users,
  action: ActionUser,
  target: Users,
  tx: Prisma.TransactionClient
): Promise<Activities> {
  const activityGroupId = nanoid();

  return await tx.activities.create({
    data: {
      id: nanoid(),
      action,
      userId: user.id,
      orgId: null,
      projectId: null,
      activityGroupId,
      targetUserId: target.id,
    },
  });
}
