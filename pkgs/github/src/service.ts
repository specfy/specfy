import { l as logger, metrics } from '@specfy/core';
import { prisma } from '@specfy/db';

import { JobDeploy } from './jobs/deploy.js';

import type { Job } from './Job.js';

let interval: NodeJS.Timeout;
const running: Job[] = [];
const l = logger.child({ svc: 'jobs' });

export async function off() {
  l.info('Exiting');
  if (interval) {
    clearInterval(interval);
  }

  await Promise.all(running);
}

export function listen() {
  l.info('Service Starting');

  // TODO: replace this with a queue and/or Listen/notify
  interval = setInterval(async () => {
    metrics.increment('jobs.loop');
    await prisma.$transaction(async (tx) => {
      const next = await tx.jobs.findFirst({
        where: { status: 'pending' },
        orderBy: { createdAt: 'asc' },
      });
      if (!next) {
        return;
      }

      const full = await tx.jobs.update({
        data: {
          status: 'running',
          startedAt: new Date(),
          updatedAt: new Date(),
        },
        where: { id: next.id },
        include: {
          Org: true,
          Project: {
            include: {
              Sources: { select: { id: true }, where: { type: 'github' } },
            },
          },
          User: true,
        },
      });

      try {
        const job = new JobDeploy(full);
        running.push(job);
        (() => job.start())();
      } catch (e) {
        l.error(e);
      }
    });
  }, 5000);
}
