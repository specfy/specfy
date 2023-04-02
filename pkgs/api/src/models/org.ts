import type { Activities, Orgs, Prisma, Users } from '@prisma/client';

import { nanoid } from '../common/id';
import type { ActionOrg } from '../types/db';

export async function createOrgActivity(
  user: Users,
  action: ActionOrg,
  target: Orgs,
  tx: Prisma.TransactionClient
): Promise<Activities> {
  const activityGroupId = nanoid();

  return await tx.activities.create({
    data: {
      id: nanoid(),
      action,
      userId: user.id,
      orgId: target.id,
      activityGroupId,
    },
  });
}
