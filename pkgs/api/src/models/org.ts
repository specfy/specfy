import type { Activities, Orgs, Prisma, Users } from '@prisma/client';

import { nanoid } from '../common/id';
import type { ActionOrg } from '../types/db';

export async function createOrg(
  tx: Prisma.TransactionClient,
  user: Users,
  data: Prisma.OrgsUncheckedCreateInput
): Promise<Orgs> {
  const tmp = await tx.orgs.create({
    data,
  });
  await createOrgActivity(user, 'Org.created', tmp, tx);

  await tx.perms.create({
    data: {
      id: nanoid(),
      orgId: data.id,
      projectId: null,
      userId: user.id,
      role: 'owner',
    },
  });

  return tmp;
}

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
