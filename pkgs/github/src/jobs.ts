import { l as consola, metrics } from '@specfy/core';
import { prisma } from '@specfy/db';

import type { Job } from './Job.js';
import { JobDeploy } from './jobs/deploy.js';

let interval: NodeJS.Timeout;
const running: Job[] = [];
const l = consola.create({}).withTag('deploy');

export async function off() {
  l.info('Exiting');
  if (interval) {
    clearInterval(interval);
  }

  await Promise.all(running);
}

export function listen() {
  l.info('Starting');

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
        include: {
          Org: true,
          Project: true,
          User: true,
        },
      });
      if (!next) {
        return;
      }

      await tx.jobs.update({
        data: {
          status: 'running',
          startedAt: new Date(),
          updatedAt: new Date(),
        },
        where: {
          id: next.id,
        },
      });

      const job = new JobDeploy(next);
      running.push(job);
      (() => job.start())();
    });
  }, 5000);
}
