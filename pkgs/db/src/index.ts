import { PrismaClient } from '@prisma/client';
import { envs } from '@specfy/core';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: envs.DATABASE_URL,
    },
  },

  // log: ['query', 'info', 'warn', 'error'],
});

export * from '@prisma/client';
