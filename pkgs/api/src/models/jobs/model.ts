import type { Prisma } from '@prisma/client';

import { nanoid } from '../../common/id.js';

import type { JobDeployConfig } from './type.js';

export async function createJobDeploy(
  {
    tx,
    orgId,
    projectId,
  }: { orgId: string; projectId: string; tx: Prisma.TransactionClient },
  config: JobDeployConfig
) {
  const job = await tx.jobs.create({
    data: {
      id: nanoid(),
      config: config as any,
      orgId,
      projectId,

      type: 'deploy',
      status: 'pending',
    },
  });

  return job;
}
