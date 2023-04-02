import type { Policies, Users, Prisma, Activities } from '@prisma/client';

import { nanoid } from '../common/id';
import type { ActionPolicy } from '../types/db';

export async function createPoliciesActivity(
  user: Users,
  action: ActionPolicy,
  target: Policies,
  tx: Prisma.TransactionClient
): Promise<Activities> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const activityGroupId = nanoid();

  return await tx.activities.create({
    data: {
      id: nanoid(),
      action,
      userId: user.id,
      orgId: target.orgId,
      activityGroupId,
      targetPolicyId: target.id,
    },
  });
}
