import { nanoid } from '@specfy/core';
import { prisma } from '@specfy/db';
import { client, mapping } from '@specfy/es';
import { getJwtToken } from '@specfy/models';

import type { Orgs, Projects, Users } from '@specfy/db';
import type { DBPerm } from '@specfy/models';

import { seedOrg } from './orgs.js';
import { seedProject } from './projects.js';
import { seedUser } from './users.js';

export async function seedSimpleUser(
  org?: Orgs | null,
  role: DBPerm['role'] = 'owner'
): Promise<{
  user: Users;
  pwd: string;
  token: string;
}> {
  const { user, pwd } = await seedUser();
  const token = getJwtToken(user);

  if (org) {
    await prisma.perms.create({
      data: {
        id: nanoid(),
        orgId: org.id,
        projectId: null,
        userId: user.id,
        role,
      },
    });
  }

  return { user, token, pwd };
}

export async function seedWithOrg(): Promise<{
  user: Users;
  org: Orgs;
  token: string;
}> {
  const { user } = await seedUser();
  const org = await seedOrg(user);

  const token = getJwtToken(user);

  return { user, org, token };
}

export async function seedWithOrgViewer(): Promise<{
  user: Users;
  owner: Users;
  org: Orgs;
  token: string;
  ownerToken: string;
}> {
  const { user } = await seedUser();
  const ownerToken = getJwtToken(user);
  const org = await seedOrg(user);

  const { user: viewer } = await seedSimpleUser(org, 'viewer');
  const token = getJwtToken(viewer);

  return { user: viewer, org, token, owner: user, ownerToken };
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
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Sources" CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Projects" CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Orgs" CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Keys" CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Flows" CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Jobs" CASCADE`);

  await client.indices.delete({
    index: 'techs',
    allow_no_indices: true,
    ignore_unavailable: true,
  });
  await mapping();
}
