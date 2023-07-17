import type { Orgs, Projects, Users } from '@prisma/client';

import { prisma } from '../../db/index.js';
import { createJobDeploy } from '../../models/index.js';
import { JobReason } from '../../models/jobs/helpers.js';

export async function seedJobs(
  users: Users[],
  { o1 }: { o1: Orgs },
  { pAnalytics }: { pAnalytics: Projects }
) {
  await prisma.$transaction(async (tx) => {
    await Promise.all([
      createJobDeploy({
        id: '53QoA4sTeI01',
        orgId: o1.id,
        projectId: pAnalytics.id,
        userId: users[0].id,
        typeId: 1,
        status: 'cancelled',
        config: { url: 'specfy/sync' },
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
        config: { url: 'specfy/sync' },
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
        config: { url: 'specfy/sync' },
        reason: {
          status: 'failed',
          code: 'org_not_installed',
          reason: JobReason.org_not_installed,
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
        config: { url: 'specfy/sync' },
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
        config: { url: 'specfy/sync' },
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
        config: { url: 'specfy/sync' },
        startedAt: new Date(),
        finishedAt: new Date(),
        tx,
      }),
    ]);
  });
}

export async function seedJob(user: Users, org: Orgs, project: Projects) {
  return createJobDeploy({
    orgId: org.id,
    projectId: project.id,
    config: { url: 'hello' },
    userId: user.id,
    tx: prisma,
  });
}
