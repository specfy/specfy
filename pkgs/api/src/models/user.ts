import type { Activities, Prisma, Users } from '@prisma/client';
import JWT from 'jsonwebtoken';

import { JWT_SECRET } from '../common/auth.js';
import { nanoid } from '../common/id.js';
import type { ActionUser } from '../types/db/index.js';

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

export const userGithubApp: Users = {
  id: 'githubapp',
  name: 'Github App',
  email: 'support+githubapp@specfy.io',
  githubLogin: null,
  password: null,
  avatarUrl: '/github-mark.png',
  createdAt: new Date('2023-01-01T00:00:01'),
  updatedAt: new Date('2023-01-01T00:00:01'),
  emailVerifiedAt: new Date('2023-01-01T00:00:01'),
};
