import { prisma } from '@specfy/db';
import {
  indexTech,
  type CatalogTech,
  type JobWithOrgProject,
  removeTechByJob,
} from '@specfy/models';
import { tech as techDb } from '@specfy/stack-analyser';

import type { AllowedKeys } from '@specfy/stack-analyser';

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

    // const dependencies = new Map<string, Dependency>();
    const techs = new Map<string, CatalogTech>();
    const base = { orgId: job.orgId, projectId: job.projectId!, jobId: job.id };

    for (const child of components) {
      // // Deduplicate dependencies
      // for (const dep of child.dependencies) {
      //   const key = dep.join('|');
      //   dependencies.set(key, dep);
      // }

      // Deduplicate techs
      for (const tech of child.techs) {
        if (techs.has(tech.id)) {
          continue;
        }
        if (tech.id === 'unknown' || !(tech.id in techDb.indexed)) {
          techs.set(tech.id, {
            ...base,
            key: tech.id,
            name: child.name,
            type: child.type,
          });
          continue;
        }

        const def = techDb.indexed[tech.id as AllowedKeys];
        techs.set(def.key, { ...base, ...def });
      }

      if (child.techId && !techs.has(child.techId)) {
        const def = techDb.indexed[child.techId as AllowedKeys];
        techs.set(def.key, { ...base, ...def });
      }
    }
    // l.info({ size: dependencies.size }, 'Preparing stack for ES');
    l.info({ size: techs.size }, 'Preparing stack for ES');

    await Promise.all([
      indexTech({ l: this.l, techs: Array.from(techs.values()) }),
      // indexDependencies({
      //   project,
      //   dependencies: Array.from(dependencies.values()),
      // }),
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
// async function indexDependencies({
//   project,
//   dependencies,
// }: {
//   project: Projects;
//   dependencies: Dependency[];
// }) {
//   const operations = dependencies.flatMap((doc) => [
//     { index: { _index: 'dependencies', _id: nanoid(20) } },
//     {
//       orgId: project.orgId,
//       projectId: project.id,
//       type: doc[0],
//       name: doc[1],
//       version: doc[2],
//     },
//   ]);
//   const bulkResponse = await client.bulk({ refresh: true, operations });

//   l.info({ size: operations.length }, 'Indexing dependencies to ES');

//   if (bulkResponse.errors) {
//     bulkResponse.items.forEach((action) => {
//       l.error(action);
//     });
//   }
// }
