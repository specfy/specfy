import fs from 'node:fs/promises';
import path from 'node:path';

import { dirname, nanoid } from '@specfy/core';
import type { Orgs, Projects, Users } from '@specfy/db';
import { prisma } from '@specfy/db';
import { createJobDeploy, jobReason } from '@specfy/models';

export async function seedJobs(
  users: Users[],
  { o1 }: { o1: Orgs },
  { pAnalytics }: { pAnalytics: Projects }
) {
  await prisma.$transaction(async (tx) => {
    const config = { url: 'specfy/sync', project: pAnalytics.config };
    await Promise.all([
      createJobDeploy({
        id: '53QoA4sTeI01',
        orgId: o1.id,
        projectId: pAnalytics.id,
        userId: users[0].id,
        typeId: 1,
        status: 'cancelled',
        config,
        startedAt: new Date(),
        finishedAt: new Date(),
        tx,
      }),
      createJobDeploy({
        id: '53QoA4sTeI02',
        orgId: o1.id,
        projectId: pAnalytics.id,
        userId: users[0].id,
        typeId: 2,
        status: 'skipped',
        config,
        startedAt: new Date(),
        finishedAt: new Date(),
        tx,
      }),
      createJobDeploy({
        id: '53QoA4sTeI03',
        orgId: o1.id,
        projectId: pAnalytics.id,
        userId: users[0].id,
        typeId: 3,
        status: 'failed',
        config,
        reason: {
          status: 'failed',
          code: 'org_not_installed',
          reason: jobReason.org_not_installed,
        },
        startedAt: new Date(),
        finishedAt: new Date(),
        tx,
      }),
      createJobDeploy({
        id: '53QoA4sTeI04',
        orgId: o1.id,
        projectId: pAnalytics.id,
        userId: users[0].id,
        typeId: 4,
        status: 'timeout',
        config,
        startedAt: new Date(),
        finishedAt: new Date(),
        tx,
      }),
      createJobDeploy({
        id: '53QoA4sTeI05',
        orgId: o1.id,
        projectId: pAnalytics.id,
        userId: users[0].id,
        typeId: 5,
        status: 'running',
        config,
        startedAt: new Date(),
        tx,
      }),
      createJobDeploy({
        id: '53QoA4sTeI06',
        orgId: o1.id,
        projectId: pAnalytics.id,
        userId: users[0].id,
        typeId: 6,
        status: 'success',
        config,
        startedAt: new Date(),
        finishedAt: new Date(),
        tx,
      }),
    ]);

    const logs = await fs.readFile(
      path.join(dirname, '../api/src/test/__fixtures__/log-deploy-success.json')
    );
    await tx.jobs.update({
      data: {
        Log: {
          create: {
            id: nanoid(),
            content: logs.toString(),
          },
        },
      },
      where: { id: '53QoA4sTeI06' },
    });
  });
}

export async function seedJob(user: Users, org: Orgs, project: Projects) {
  return createJobDeploy({
    orgId: org.id,
    projectId: project.id,
    config: { url: 'hello', project: project.config },
    userId: user.id,
    tx: prisma,
  });
}
