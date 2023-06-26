import type { Jobs } from '@prisma/client';
import type { ConsolaInstance } from 'consola';
import { consola } from 'consola';

import { prisma } from '../../db/index.js';
import { JobReason } from '../../models/jobs/helpers.js';
import type { JobCode } from '../../models/jobs/type.js';

export interface Mark {
  status: Jobs['status'];
  code: JobCode;
  reason: string;
  err?: string | undefined;
}
export abstract class Job {
  l: ConsolaInstance;
  #job: Jobs;
  #mark?: Mark;

  constructor(job: Jobs) {
    this.#job = job;
    this.l = consola.create({}).withTag('job');
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
        await this.teardown();
      } catch (err: unknown) {
        this.mark('failed', 'failed_to_teardown', err);
      }
    }

    await prisma.jobs.update({
      data: {
        status: this.#mark?.status || 'failed',
        reason: this.#mark
          ? (this.#mark as any)
          : { code: 'unknown', reason: JobReason.unknown },
        updatedAt: new Date(),
        finishedAt: new Date(),
      },
      where: {
        id: this.#job.id,
      },
    });
    l.info('Job end', { id: this.#job.id, mark: this.#mark });
  }

  mark(status: Mark['status'], code: Mark['code'], err?: unknown) {
    let _err: string | undefined;
    if (err) {
      this.l.error(err);
      _err = err instanceof Error ? err.message : '';
    }

    this.#mark = { status, code, reason: JobReason[code], err: _err };
  }

  abstract process(job: Jobs): Promise<void>;
  abstract teardown(): Promise<void>;
}
