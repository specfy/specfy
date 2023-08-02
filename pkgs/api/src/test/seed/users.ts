import type { Users } from '@prisma/client';

import { envs } from '../../common/env.js';
import { nanoid } from '../../common/id.js';
import { prisma } from '../../db/index.js';
import { pbkdf2 } from '../../middlewares/auth/local.js';
import { userGithubApp } from '../../models/users/model.js';

/**
 * Seed users
 */
export async function seedUsers(): Promise<Users[]> {
  // Users
  const [u1, u2, u3, u4, u5, u6, u7, u8] = await Promise.all([
    seedDefaultAccount(),
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
    await prisma.users.create({
      data: userGithubApp,
    }),
  ]);

  return [u1, u2, u3, u4, u5, u6, u7, u8];
}

export async function seedDefaultAccount(): Promise<Users> {
  let email = envs.DEFAULT_ACCOUNT;
  if (!email) {
    console.warn('⚠️  No DEFAULT_ACCOUNT');
    email = `${nanoid()}@default.com`;
  }

  return await prisma.users.create({
    data: {
      id: nanoid(),
      name: 'Demo Account',
      email,
      password: pbkdf2('defaultpassword').toString('hex'),
    },
  });
}

export async function seedUser(): Promise<{ user: Users; pwd: string }> {
  const id = nanoid();
  const pwd = nanoid();
  return {
    user: await prisma.users.create({
      data: {
        id,
        name: `User ${id}`,
        email: `user.${id}@gmail.com`,
        password: pbkdf2(pwd).toString('hex'),
      },
    }),
    pwd,
  };
}
