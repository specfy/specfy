import { prisma } from '@specfy/db';
import {
  indexTech,
  type JobWithOrgProject,
  removeTechByJob,
  componentsToCatalog,
} from '@specfy/models';

import { Job } from '../Job.js';

export class JobProjectIndex extends Job {
  async process(job: JobWithOrgProject): Promise<void> {
    const l = this.l;

    if (!job.Org || !job.Project) {
      this.mark('failed', 'missing_dependencies');
      return;
    }

    const components = await prisma.components.findMany({
      where: { orgId: job.orgId, projectId: job.projectId! },
      select: { name: true, type: true, techs: true, techId: true },
    });

    const techs = componentsToCatalog(job, components);

    l.info({ size: techs.size }, 'Preparing stack for ES');

    await Promise.all([
      indexTech({ l: this.l, techs: Array.from(techs.values()) }),
    ]);

    l.info('Cleaning old data');
    await removeTechByJob({ job });
    l.info('Cleaned');

    this.mark('success', 'success');
  }

  /**
   * Clean up
   */
  async teardown(): Promise<void> {
    // nothing
  }
}
