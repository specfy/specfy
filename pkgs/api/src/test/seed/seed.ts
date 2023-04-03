import type { Orgs, Projects, Users } from '@prisma/client';

import { nanoid } from '../../common/id';
import { prisma } from '../../db';
import { getJwtToken } from '../../models/user';

import { seedOrg } from './orgs';
import { seedProject } from './projects';
import { seedUser } from './users';

export async function seedSimpleUser(): Promise<{
  user: Users;
  token: string;
}> {
  const user = await seedUser();
  const token = getJwtToken(user);

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
  await Promise.all([
    prisma.$executeRawUnsafe(`TRUNCATE TABLE "Accounts" CASCADE`),
    prisma.$executeRawUnsafe(`TRUNCATE TABLE "Activities" CASCADE`),
    prisma.$executeRawUnsafe(`TRUNCATE TABLE "Blobs" CASCADE`),
    prisma.$executeRawUnsafe(`TRUNCATE TABLE "Comments" CASCADE`),
    prisma.$executeRawUnsafe(`TRUNCATE TABLE "Components" CASCADE`),
    prisma.$executeRawUnsafe(`TRUNCATE TABLE "Documents" CASCADE`),
    prisma.$executeRawUnsafe(`TRUNCATE TABLE "Policies" CASCADE`),
    prisma.$executeRawUnsafe(`TRUNCATE TABLE "Revisions" CASCADE`),
    prisma.$executeRawUnsafe(`TRUNCATE TABLE "TypeHasUsers" CASCADE`),
    prisma.$executeRawUnsafe(`TRUNCATE TABLE "Perms" CASCADE`),
    prisma.$executeRawUnsafe(`TRUNCATE TABLE "Users" CASCADE`),
  ]);
  // Split in two because those table are referenced everywhere and it deadlocks
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Projects" CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Orgs" CASCADE`);

  // prisma.activities.deleteMany(),
  // prisma.blobs.deleteMany(),
  // prisma.comments.deleteMany(),
  // prisma.components.deleteMany(),
  // prisma.documents.deleteMany(),
  // prisma.policies.deleteMany(),
  // prisma.revisions.deleteMany(),
  // prisma.typeHasUsers.deleteMany(),
  // prisma.perms.deleteMany(),
  // prisma.users.deleteMany(),
  // prisma.projects.deleteMany(),
  // prisma.orgs.deleteMany(),
}
