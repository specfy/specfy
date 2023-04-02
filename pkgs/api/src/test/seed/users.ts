import type { Users } from '@prisma/client';

import { nanoid } from '../../common/id';
import { prisma } from '../../db';

/**
 * Seed users
 */
export async function seedUsers(): Promise<Users[]> {
  // Users
  const [u1, u2, u3, u4, u5, u6, u7, u8] = await Promise.all([
    await prisma.users.create({
      data: {
        id: nanoid(),
        name: 'Samuel Bodin',
        email: 'bodin.samuel@gmail.com',
      },
    }),
    await prisma.users.create({
      data: {
        id: nanoid(),
        name: 'Raphael Daguenet',
        email: 'raphdag@gmail.com',
      },
    }),
    await prisma.users.create({
      data: {
        id: nanoid(),
        name: 'Nicolas Torres',
        email: 'nicote@gmail.com',
      },
    }),
    await prisma.users.create({
      data: {
        id: nanoid(),
        name: 'John Doe',
        email: 'john.doe@gmail.com',
      },
    }),
    await prisma.users.create({
      data: {
        id: nanoid(),
        name: 'Alice Wong',
        email: 'alice.wong@gmail.com',
      },
    }),
    await prisma.users.create({
      data: {
        id: nanoid(),
        name: 'Walther Phillips',
        email: 'WalterLPhillips@gmail.com',
      },
    }),
    await prisma.users.create({
      data: {
        id: nanoid(),
        name: 'Clementine Dandonneau',
        email: 'ClementineDandonneau@gmail.com',
      },
    }),
    await prisma.users.create({
      data: {
        id: nanoid(),
        name: 'Lisha A. James',
        email: 'LishaAJames@gmail.com',
      },
    }),
  ]);

  return [u1, u2, u3, u4, u5, u6, u7, u8];
}

export async function seedUser(): Promise<Users> {
  const id = nanoid();
  return await prisma.users.create({
    data: { id, name: `User ${id}`, email: `user.${id}@gmail.com` },
  });
}
