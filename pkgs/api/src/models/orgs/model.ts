import { nanoid } from '@specfy/core';
import type { Activities, Orgs, Prisma, Users } from '@specfy/db';

import { acronymize, stringToColor } from '../../common/avatar.js';
import type { ActionOrg } from '../activities/types.js';
import { recomputeOrgGraph } from '../flows/helpers.rebuild.js';
import { createKey } from '../keys/model.js';

export type { Orgs } from '@specfy/db';

export async function createOrg(
  tx: Prisma.TransactionClient,
  user: Users,
  data: Omit<
    Prisma.OrgsUncheckedCreateInput,
    | 'acronym'
    | 'color'
    | 'currentPlanId'
    | 'stripeCurrentPeriodEnd'
    | 'stripeCurrentPeriodStart'
  >
): Promise<Orgs> {
  const acronym = acronymize(data.name);
  const colors = stringToColor(data.name);

  const tmp = await tx.orgs.create({
    data: {
      ...data,
      acronym,
      color: colors.palette,
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

  const update: Prisma.OrgsUncheckedUpdateInput = {};

  // Finally creating the associated empty flow
  const flow = await recomputeOrgGraph({ orgId: tmp.id, tx });
  update.flowId = flow.id;
  return await tx.orgs.update({
    data: update,
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
