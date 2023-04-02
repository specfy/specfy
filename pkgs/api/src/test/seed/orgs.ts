import type { Orgs, Users } from '@prisma/client';

import { nanoid } from '../../common/id';
import { prisma } from '../../db';
import { createOrgActivity } from '../../models/org';

/**
 * Seed organizations
 */
export async function seedOrgs(
  users: Users[]
): Promise<{ o1: Orgs; o2: Orgs }> {
  const o1 = await prisma.orgs.create({
    data: { id: 'company', name: 'My Company' },
  });
  await createOrgActivity(users[0], 'Org.created', o1, prisma);

  const o2 = await prisma.orgs.create({
    data: { id: 'samuelbodin', name: "Samuel Bodin's org" },
  });
  await createOrgActivity(users[0], 'Org.created', o2, prisma);

  await Promise.all([
    ...[o1.id, o2.id].map((id) => {
      return prisma.perms.create({
        data: {
          id: nanoid(),
          orgId: id,
          projectId: null,
          userId: users[0].id,
          role: 'owner',
        },
      });
    }),

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
  const id = nanoid();
  const org = await prisma.orgs.create({
    data: {
      id,
      name: `Org ${id}`,
    },
  });
  await createOrgActivity(user, 'Org.created', org, prisma);

  return org;
}
