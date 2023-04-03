import type { Users, Prisma, Activities, Revisions } from '@prisma/client';

import { nanoid } from '../common/id';
import type { ActionRevision } from '../types/db';

export async function createRevisionActivity(
  user: Users,
  action: ActionRevision,
  target: Revisions,
  tx: Prisma.TransactionClient
): Promise<Activities> {
  const activityGroupId = nanoid();

  return await tx.activities.create({
    data: {
      id: nanoid(),
      action,
      userId: user.id,
      orgId: target.orgId,
      projectId: target.projectId,
      activityGroupId,
      targetRevisionId: target.id,
    },
  });
}
