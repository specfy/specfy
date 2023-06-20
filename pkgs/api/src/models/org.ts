import type { Activities, Orgs, Prisma, Users } from '@prisma/client';

import { acronymize, stringToColor } from '../common/avatar';
import { nanoid } from '../common/id';
import type { ActionOrg } from '../types/db';

import { createKey } from './key';

export async function createOrg(
  tx: Prisma.TransactionClient,
  user: Users,
  data: Omit<Prisma.OrgsUncheckedCreateInput, 'acronym' | 'color'>
): Promise<Orgs> {
  const acronym = acronymize(data.name);
  const colors = stringToColor(data.name);
  const tmp = await tx.orgs.create({
    data: {
      ...data,
      acronym,
      color: colors.backgroundColor,
    },
  });
  await tx.perms.create({
    data: {
      id: nanoid(),
      orgId: data.id,
      projectId: null,
      userId: user.id,
      role: 'owner',
    },
  });

  const activityGroupId = nanoid();
  await createOrgActivity({
    user,
    action: 'Org.created',
    target: tmp,
    tx,
    activityGroupId,
  });

  await createKey({ tx, user, data: { orgId: tmp.id }, activityGroupId });

  return tmp;
}

export async function createOrgActivity({
  user,
  action,
  target,
  tx,
  activityGroupId = null,
}: {
  user: Users;
  action: ActionOrg;
  target: Orgs;
  tx: Prisma.TransactionClient;
  activityGroupId?: string | null;
}): Promise<Activities> {
  return await tx.activities.create({
    data: {
      id: nanoid(),
      action,
      userId: user.id,
      orgId: target.id,
      activityGroupId,
      createdAt: new Date(),
    },
  });
}
