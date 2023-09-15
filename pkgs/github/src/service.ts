import { l as logger, metrics } from '@specfy/core';
import { prisma } from '@specfy/db';

import type { Job } from './Job.js';
import { JobDeploy } from './jobs/deploy.js';

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
        where: {
          status: 'pending',
        },
        orderBy: {
          createdAt: 'asc',
        },
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
        where: {
          id: next.id,
        },
        include: {
          Org: true,
          Project: true,
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
