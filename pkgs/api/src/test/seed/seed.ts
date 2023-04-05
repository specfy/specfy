import type { Orgs, Projects, Users } from '@prisma/client';

import { nanoid } from '../../common/id';
import { prisma } from '../../db';
import { getJwtToken } from '../../models';

import { seedOrg } from './orgs';
import { seedProject } from './projects';
import { seedUser } from './users';

export async function seedSimpleUser(org?: Orgs): Promise<{
  user: Users;
  token: string;
}> {
  const user = await seedUser();
  const token = getJwtToken(user);

  if (org) {
    await prisma.perms.create({
      data: {
        id: nanoid(),
        orgId: org.id,
        projectId: null,
        userId: user.id,
        role: 'owner',
      },
    });
  }

  return { user, token };
}

export async function seedWithOrg(): Promise<{
  user: Users;
  org: Orgs;
  token: string;
}> {
  const user = await seedUser();
  const org = await seedOrg(user);

  await prisma.perms.create({
    data: {
      id: nanoid(),
      orgId: org.id,
      projectId: null,
      userId: user.id,
      role: 'owner',
    },
  });

  const token = getJwtToken(user);

  return { user, org, token };
}

export async function seedWithProject(): Promise<{
  user: Users;
  org: Orgs;
  project: Projects;
  token: string;
}> {
  const { user, org, token } = await seedWithOrg();
  const project = await seedProject(user, org);

  return { user, org, token, project };
}

export async function truncate() {
  // Split because those table are referenced everywhere and it deadlocks
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Accounts" CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Activities" CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Blobs" CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Comments" CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Components" CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Documents" CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Policies" CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Revisions" CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "TypeHasUsers" CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Perms" CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Users" CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Projects" CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Orgs" CASCADE`);
}
