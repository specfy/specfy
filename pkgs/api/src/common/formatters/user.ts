import type { Users } from '@prisma/client';

import type { ApiUser } from '../../types/api';

export function toApiUser(user: Users): ApiUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}
