import type { Jobs } from '@prisma/client';
import type { ConsolaInstance } from 'consola';
import { consola } from 'consola';

import { prisma } from '../../db/index.js';
import { toApiJob } from '../../models/jobs/formatter.js';
import { JobReason } from '../../models/jobs/helpers.js';
import type { JobMark, JobWithOrgProject } from '../../models/jobs/type.js';
import { toApiProject } from '../../models/project/project.js';
import { io } from '../../socket.js';
import type { EventJob } from '../../types/socket.js';

export abstract class Job {
  l: ConsolaInstance;
  #job: JobWithOrgProject;
  #mark?: JobMark;

  constructor(job: JobWithOrgProject) {
    this.#job = job;
    this.l = consola.create({}).withTag('job');
  }

  getMark() {
    return this.#mark;
  }

  async start() {
    const job = this.#job;
    const l = this.l;
    l.info('Job start', { id: job.id });
    const evt: EventJob = {
      job: toApiJob(job),
      project: toApiProject(job.Project!),
    };

    io.to(`project-${job.projectId}`).emit('job.start', evt);

    try {
      await this.process(job as any);
    } catch (err: unknown) {
      l.error('Uncaught error during job', err);
      this.mark('failed', 'unknown', err);
    } finally {
      // Clean after ourself
      try {
        await this.teardown(job);
      } catch (err: unknown) {
        this.mark('failed', 'failed_to_teardown', err);
      }
    }

    const jobUpdated = await prisma.jobs.update({
      data: {
        status: this.#mark?.status || 'failed',
        reason: this.#mark
          ? this.#mark
          : { status: 'failed', code: 'unknown', reason: JobReason.unknown },
        updatedAt: new Date(),
        finishedAt: new Date(),
      },
      where: {
        id: job.id,
      },
    });
    l.info('Job end', { id: job.id, mark: this.#mark });

    evt.job = toApiJob({ ...jobUpdated, User: job.User });
    io.to(`project-${job.projectId}`).emit('job.finish', evt);
  }

  mark(status: JobMark['status'], code: JobMark['code'], err?: unknown) {
    let _err: string | undefined;
    if (err) {
      this.l.error(err);
      _err = err instanceof Error ? err.message : '';
    }

    this.#mark = { status, code, reason: JobReason[code], err: _err };
  }

  abstract process(job: Jobs): Promise<void>;
  abstract teardown(job: Jobs): Promise<void>;
}
