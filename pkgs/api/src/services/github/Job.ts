import type { Jobs } from '@prisma/client';
import type { ConsolaInstance } from 'consola';
import { consola } from 'consola';

import { prisma } from '../../db/index.js';
import { JobReason } from '../../models/jobs/helpers.js';
import type { JobMark } from '../../models/jobs/type.js';

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
    const l = this.l;
    l.info('Job start', { id: this.#job.id });

    try {
      await this.process(this.#job as any);
    } catch (err: unknown) {
      l.error('Uncaught error during job', err);
      this.mark('failed', 'unknown', err);
    } finally {
      // Clean after ourself
      try {
        await this.teardown(this.#job);
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
        id: this.#job.id,
      },
    });
    l.info('Job end', { id: this.#job.id, mark: this.#mark });
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
