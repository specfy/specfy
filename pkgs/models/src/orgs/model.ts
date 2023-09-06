import { nanoid, acronymize, stringToColor } from '@specfy/core';
import type { Activities, Orgs, Prisma, Users } from '@specfy/db';

import type { ActionOrg } from '../activities/types.js';
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

  // Finally creating the associated empty flow
  const flow = await tx.flows.create({
    data: { id: nanoid(), orgId: tmp.id, flow: { nodes: [], edges: [] } },
  });

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
