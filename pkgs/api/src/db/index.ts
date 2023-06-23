import { PrismaClient } from '@prisma/client';

import { env } from '../common/env.js';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env('DATABASE_URL')!,
    },
  },
  // log: ['query', 'info', 'warn', 'error'],
});
