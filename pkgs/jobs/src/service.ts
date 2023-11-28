import { l as logger, metrics } from '@specfy/core';
import { prisma } from '@specfy/db';

import { JobBackfillGithub } from './jobs/backfillGithub.js';
import { JobDeploy } from './jobs/deploy.js';
import { JobProjectIndex } from './jobs/projectIndex.js';

import type { Job } from './Job.js';

let interval: NodeJS.Timeout;
const running: Job[] = [];
const l = logger.child({ svc: 'jobs' });

export async function stop() {
  l.info('Jobs service stopping');
  if (interval) {
    clearInterval(interval);
  }

  await Promise.all(running);
}

export function start() {
  l.info('Job service starting');

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
          Project: true,
          User: true,
        },
      });

      try {
        let job: Job;
        switch (full.type) {
          case 'deploy': {
            job = new JobDeploy(full);
            break;
          }

          case 'projectIndex': {
            job = new JobProjectIndex(full);
            break;
          }

          case 'backfillGithub': {
            job = new JobBackfillGithub(full);
            break;
          }
        }

        running.push(job);
        (() => job.start())();
      } catch (e) {
        l.error(e);
      }
    });
  }, 5000);
}
