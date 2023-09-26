import { nanoid } from '@specfy/core';
import { prisma } from '@specfy/db';
import { createFreeSubscription, createOrg } from '@specfy/models';
import { customAlphabet } from 'nanoid/non-secure';

import type { Orgs, Users } from '@specfy/db';

export const createOrgId = customAlphabet('abcdefghijklmnopqrstuvwxyz', 20);

/**
 * Seed organizations
 */
export async function seedOrgs(
  users: Users[]
): Promise<{ o1: Orgs; o2: Orgs }> {
  const o1 = await createOrg(prisma, users[0], {
    id: 'acme',
    name: 'Acme',
  });
  await createFreeSubscription({ org: o1, me: users[0] });

  const o2 = await createOrg(prisma, users[0], {
    id: 'samuelbodin',
    name: "Samuel Bodin's org",
  });
  await createFreeSubscription({ org: o2, me: users[0] });

  await Promise.all([
    ...users.map((u, i) => {
      if (i === 0) {
        return;
      }
      return prisma.perms.create({
        data: {
          id: nanoid(),
          orgId: o1.id,
          projectId: null,
          userId: u.id,
          role: 'viewer',
        },
      });
    }),
  ]);

  return { o1, o2 };
}

export async function seedOrg(user: Users) {
  const id = createOrgId();
  const org = await createOrg(prisma, user, {
    id,
    name: `Org ${id}`,
  });

  return org;
}
