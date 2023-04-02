import type { Users } from '@prisma/client';
import JWT from 'jsonwebtoken';

import { JWT_SECRET } from '../common/auth';

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
