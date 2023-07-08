import type { Orgs, Projects, Users } from '@prisma/client';

import { prisma } from '../../db/index.js';

export async function seedJobs(
  users: Users[],
  { o1 }: { o1: Orgs },
  { pAnalytics }: { pAnalytics: Projects }
) {
  await prisma.jobs.create({
    data: {
      id: '53QoA4sTeI01',
      orgId: o1.id,
      projectId: pAnalytics.id,
      type: 'deploy',
      status: 'cancelled',
      config: { url: 'specfy/sync' },
      userId: users[0].id,
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: new Date(),
      finishedAt: new Date(),
    },
  });

  await prisma.jobs.create({
    data: {
      id: '53QoA4sTeI02',
      orgId: o1.id,
      projectId: pAnalytics.id,
      type: 'deploy',
      status: 'skipped',
      config: { url: 'specfy/sync' },
      userId: users[0].id,
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: new Date(),
      finishedAt: new Date(),
    },
  });

  await prisma.jobs.create({
    data: {
      id: '53QoA4sTeI03',
      orgId: o1.id,
      projectId: pAnalytics.id,
      type: 'deploy',
      status: 'failed',
      reason: 'Specfy App is not installed on the Github organization',
      config: { url: 'specfy/sync' },
      userId: users[0].id,
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: new Date(),
      finishedAt: new Date(),
    },
  });

  await prisma.jobs.create({
    data: {
      id: '53QoA4sTeI04',
      orgId: o1.id,
      projectId: pAnalytics.id,
      type: 'deploy',
      status: 'timeout',
      config: { url: 'specfy/sync' },
      userId: users[0].id,
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: new Date(),
      finishedAt: null,
    },
  });

  await prisma.jobs.create({
    data: {
      id: '53QoA4sTeI05',
      orgId: o1.id,
      projectId: pAnalytics.id,
      type: 'deploy',
      status: 'running',
      config: { url: 'specfy/sync' },
      userId: users[0].id,
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: new Date(),
      finishedAt: null,
    },
  });

  await prisma.jobs.create({
    data: {
      id: '53QoA4sTeI06',
      orgId: o1.id,
      projectId: pAnalytics.id,
      type: 'deploy',
      status: 'success',
      config: { url: 'specfy/sync' },
      userId: users[0].id,
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: new Date(),
      finishedAt: new Date(),
    },
  });
}
