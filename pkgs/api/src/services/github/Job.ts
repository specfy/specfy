import type { Jobs } from '@prisma/client';
import type { ConsolaInstance } from 'consola';
import { consola } from 'consola';

import { prisma } from '../../db/index.js';
import { JobReason } from '../../models/jobs/helpers.js';
import type { JobMark } from '../../models/jobs/type.js';
import { io } from '../../socket.js';
import type { EventJob } from '../../types/socket.js';

export abstract class Job {
  l: ConsolaInstance;
  #job: Jobs;
  #mark?: JobMark;

  constructor(job: Jobs) {
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
      id: job.id,
      orgId: job.orgId,
      projectId: job.projectId,
      type: job.type,
      typeId: job.typeId,
      status: job.status,
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

    await prisma.jobs.update({
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

    evt.status = this.#mark?.status || 'failed';
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
