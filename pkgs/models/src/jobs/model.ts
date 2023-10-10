import { l, logEvent, nanoid } from '@specfy/core';
import { Prisma } from '@specfy/db';

import type { Jobs } from '@specfy/db';

import type { JobDeployConfig, JobProjectIndexConfig } from './types.js';
import type { SetNonNullable } from 'type-fest';

type Props = Omit<Partial<Jobs>, 'logs' | 'config'> &
  SetNonNullable<
    Pick<Jobs, 'orgId' | 'projectId' | 'userId'>,
    'projectId' | 'userId'
  > & {
    tx: Prisma.TransactionClient;
  };

export async function createJobDeploy({
  tx,
  orgId,
  projectId,
  config,
  userId,
  ...rest
}: Props & { config: JobDeployConfig }) {
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

  logEvent('jobs.created', { orgId, projectId, userId, type: 'deploy' });

  return job;
}

export async function createJobProjectIndex({
  tx,
  orgId,
  projectId,
  config,
  userId,
  ...rest
}: Props & { config: JobProjectIndexConfig }) {
  l.info('Creating index job', { orgId, projectId, config });
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
      type: 'projectIndex',
      typeId: rest.typeId || (await getJobTypeId({ orgId, projectId, tx })),
    },
  });

  logEvent('jobs.created', { orgId, projectId, userId, type: 'projectIndex' });

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
