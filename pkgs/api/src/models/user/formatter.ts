import type { Users } from '@prisma/client';

import type { ApiMe, ApiUser } from '../../types/api/index.js';

import { getJwtToken } from './model.js';

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
    token: getJwtToken(user, new Date(Date.now() + 3600 * 1000)),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
