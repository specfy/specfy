import { PrismaClient } from '@prisma/client';

import { envs } from '../common/env.js';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: envs.DATABASE_URL,
    },
  },
  // log: ['query', 'info', 'warn', 'error'],
});
