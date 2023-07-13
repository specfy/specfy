import type { Jobs } from '@prisma/client';
import { Prisma } from '@prisma/client';
import type { SetNonNullable } from 'type-fest';

import { nanoid } from '../../common/id.js';

export async function createJobDeploy({
  tx,
  orgId,
  projectId,
  config,
  userId,
  ...rest
}: Partial<Jobs> &
  SetNonNullable<
    Pick<Jobs, 'config' | 'orgId' | 'projectId' | 'userId'>,
    'projectId' | 'userId'
  > & {
    tx: Prisma.TransactionClient;
  }) {
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
