import { l, logEvent, nanoid } from '@specfy/core';
import { Prisma } from '@specfy/db';

import type { Jobs } from '@specfy/db';

import type { SetNonNullable } from 'type-fest';

export async function createJobDeploy({
  tx,
  orgId,
  projectId,
  config,
  userId,
  ...rest
}: Omit<Partial<Jobs>, 'logs'> &
  SetNonNullable<
    Pick<Jobs, 'config' | 'orgId' | 'projectId' | 'userId'>,
    'projectId' | 'userId'
  > & {
    tx: Prisma.TransactionClient;
  }) {
  l.info('Creating deploy job', { orgId, projectId, config });
  const job = await tx.jobs.create({
    data: {
      id: nanoid(),
      ...rest,
      status: rest.status || 'pending',
      reason: rest.reason || Prisma.DbNull,
      config,
      orgId,
      projectId,
      userId,
      type: 'deploy',
      typeId: rest.typeId || (await getJobTypeId({ orgId, projectId, tx })),
    },
  });

  logEvent('jobs.created', { orgId, projectId, userId });

  return job;
}

export async function getJobTypeId({
  orgId,
  projectId,
  tx,
}: {
  orgId: string;
  projectId: string;
  tx: Prisma.TransactionClient;
}) {
  const count = await tx.jobs.count({
    where: { orgId: orgId, projectId: projectId },
  });
  return count + 1;
}
