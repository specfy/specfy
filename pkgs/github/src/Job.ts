import type { Logger } from '@specfy/core';
import { l as defaultLogger, metrics } from '@specfy/core';
import { prisma } from '@specfy/db';
import type { Jobs } from '@specfy/db';
import type { JobMark, JobWithOrgProject } from '@specfy/models';
import { toApiProject, toApiJob, jobReason } from '@specfy/models';
import type { EventJob } from '@specfy/socket';
import { io } from '@specfy/socket';

export abstract class Job {
  l: Logger;
  #job: JobWithOrgProject;
  #mark?: JobMark;
  // #logs: string;

  constructor(job: JobWithOrgProject) {
    this.#job = job;
    // this.#logs = `/tmp/specfy_logs_${job.id}_${nanoid()}.log`;
    this.l = defaultLogger;

    // Unsatisfying solution right now
    // this.l = createFileLogger({ svc: 'jobs', jobId: job.id }, this.#logs);
  }

  getMark() {
    return this.#mark;
  }

  async start() {
    const job = this.#job;
    const l = this.l;

    metrics.increment('jobs.loop.start');

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
          : { status: 'failed', code: 'unknown', reason: jobReason.unknown },
        // logs: this.#logs, // TODO: store the file maybe?
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

    metrics.increment('jobs.loop.end');
  }

  mark(status: JobMark['status'], code: JobMark['code'], err?: unknown) {
    let _err: string | undefined;
    if (err) {
      _err = err instanceof Error ? err.message : '';
      this.l.error(_err || 'Error', err);
    }

    this.#mark = { status, code, reason: jobReason[code], err: _err };
  }

  abstract process(job: Jobs): Promise<void>;
  abstract teardown(job: Jobs): Promise<void>;
}
