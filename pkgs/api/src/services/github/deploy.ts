import type { Jobs, Prisma } from '@prisma/client';
import { $ } from 'execa';

import { prisma } from '../../db/index.js';
import { l as consola } from '../../logger.js';
import type { JobDeploy, JobWithOrgProject } from '../../types/db/index.js';
import { JobReason } from '../../types/db/index.js';

import { github } from './app.js';

let interval: NodeJS.Timeout;
const running: Array<Promise<void>> = [];
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
        },
      });
      if (!next) {
        return;
      }

      await tx.jobs.update({
        data: { status: 'running' },
        where: {
          id: next.id,
        },
      });

      running.push(jobWrapper(next, deploy));
    });
  }, 5000);
}

export async function jobWrapper(
  next: Jobs,
  process: (job: any) => Promise<Prisma.JobsUpdateInput>
): Promise<void> {
  l.info('Job start', next);

  let update: Prisma.JobsUpdateInput;
  try {
    update = await process(next as any);
  } catch (err: unknown) {
    l.error('Uncaught error during job', err);
    update = { status: 'failed', reason: JobReason.unknown };
  }

  await prisma.jobs.update({
    data: update,
    where: {},
  });
  l.info('Job end', next, update);
}
export async function deploy(
  job: JobWithOrgProject
): Promise<Prisma.JobsUpdateInput> {
  const config = job.config as unknown as JobDeploy;

  if (!job.Org || !job.Project) {
    return { status: 'failed', reason: JobReason.missing_dependencies };
  }

  if (!job.Org.githubInstallationId) {
    return { status: 'failed', reason: JobReason.org_not_installed };
  }

  if (!job.Project.githubRepository) {
    return { status: 'failed', reason: JobReason.project_not_installed };
  }

  let token: string;
  try {
    const auth = await github.octokit.rest.apps.createInstallationAccessToken({
      installation_id: job.Org.githubInstallationId,
      repositories: [job.Project.githubRepository],
    });
    token = auth.data.token;
  } catch (err: unknown) {
    return { status: 'failed', reason: JobReason.cant_auth_github };
  }

  const {
    stderr,
    stdout,
  } = $`git clone https://x-access-token:${token}@github.com/${config.url}.git`;

  console.log({ stderr, stdout });
  return { status: 'success' };
}
