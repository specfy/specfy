import type { User } from '../../models';
import { Perm, Org } from '../../models';

/**
 * Seed organizations
 */
export async function seedOrgs(users: User[]): Promise<{ o1: Org; o2: Org }> {
  const o1 = await Org.create({
    id: 'company',
    name: 'My Company',
  });
  await o1.onAfterCreate(users[0]);

  const o2 = await Org.create({
    id: 'samuelbodin',
    name: "Samuel Bodin's org",
  });
  await o2.onAfterCreate(users[0]);

  await Promise.all([
    ...[o1.id, o2.id].map((id) => {
      return Perm.create({
        orgId: id,
        projectId: null,
        userId: users[0].id,
        role: 'owner',
      });
    }),

    ...users.map((u, i) => {
      if (i === 0) {
        return;
      }
      return Perm.create({
        orgId: o1.id,
        projectId: null,
        userId: u.id,
        role: 'viewer',
      });
    }),
  ]);
  return { o1, o2 };
}
