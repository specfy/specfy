import type { Users } from '@prisma/client';

import type { ApiMe, ApiUser } from '../../types/api';

export function toApiUser(user: Users): ApiUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
  };
}

export function toApiMe(user: Users): ApiMe {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
