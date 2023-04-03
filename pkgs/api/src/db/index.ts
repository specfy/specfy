import { PrismaClient } from '@prisma/client';

import { env } from '../common/env';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env('DATABASE_URL')!,
    },
  },
  // log: ['query', 'info', 'warn', 'error'],
});

export async function start() {
  // await prisma.$connect();
}

export async function close() {
  await prisma.$disconnect();
}
