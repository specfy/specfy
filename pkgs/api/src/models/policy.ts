import type { Policies, Users, Prisma, Activities } from '@prisma/client';

import { nanoid } from '../common/id';
import type { ActionPolicy } from '../types/db';

export async function createPoliciesActivity({
  user,
  action,
  target,
  tx,
  activityGroupId = null,
}: {
  user: Users;
  action: ActionPolicy;
  target: Policies;
  tx: Prisma.TransactionClient;
  activityGroupId?: string | null;
}): Promise<Activities> {
  return await tx.activities.create({
    data: {
      id: nanoid(),
      action,
      userId: user.id,
      orgId: target.orgId,
      activityGroupId,
      targetPolicyId: target.id,
      createdAt: new Date(),
    },
  });
}
