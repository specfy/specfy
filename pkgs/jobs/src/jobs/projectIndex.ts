import type { JobWithOrgProject } from '@specfy/models';

import { Job } from '../Job.js';

export class JobProjectIndex extends Job {
  async process(job: JobWithOrgProject): Promise<void> {
    const config = job.config;
    const l = this.l;
  }

  /**
   * Clean up
   */
  async teardown(job: JobWithOrgProject): Promise<void> {
    const l = this.l;
  }
}
