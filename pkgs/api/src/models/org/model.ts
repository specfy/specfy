import type { Activities, Orgs, Prisma, Users } from '@prisma/client';

import { acronymize, stringToColor } from '../../common/avatar.js';
import { nanoid } from '../../common/id.js';
import type { ActionOrg } from '../../types/db/index.js';
import { recomputeOrgGraph } from '../flows/helpers.js';
import { createKey } from '../key/model.js';

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

  // Put the creator as owner
  await tx.perms.create({
    data: {
      id: nanoid(),
      orgId: data.id,
      projectId: null,
      userId: user.id,
      role: 'owner',
    },
  });

  // Log everything
  const activityGroupId = nanoid();
  await createOrgActivity({
    user,
    action: 'Org.created',
    target: tmp,
    tx,
    activityGroupId,
  });

  // Add a default api key
  await createKey({ tx, user, data: { orgId: tmp.id }, activityGroupId });

  // Finally creating the associated empty flow
  const flow = await recomputeOrgGraph({ orgId: tmp.id, tx });
  return await tx.orgs.update({
    data: { flowId: flow.id },
    where: { id: tmp.id },
  });
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
