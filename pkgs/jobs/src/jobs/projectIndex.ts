import { isTest, nanoid } from '@specfy/core';
import { prisma } from '@specfy/db';
import { client } from '@specfy/es';
import { tech as techDb } from '@specfy/stack-analyser';

import type { ComponentType, JobWithOrgProject } from '@specfy/models';
import type { AllowedKeys } from '@specfy/stack-analyser';

import { Job } from '../Job.js';

type Tech = { type: ComponentType; key: string; name: string };

export class JobProjectIndex extends Job {
  async process(job: JobWithOrgProject): Promise<void> {
    const l = this.l;

    if (!job.Org || !job.Project) {
      this.mark('failed', 'missing_dependencies');
      return;
    }

    const components = await prisma.components.findMany({
      where: { orgId: job.orgId, projectId: job.projectId! },
      select: {
        name: true,
        type: true,
        techs: true,
        techId: true,
      },
    });

    // TODO: delete previous

    // const dependencies = new Map<string, Dependency>();
    const techs = new Map<string, Tech>();

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
            key: tech.id,
            name: child.name,
            type: child.type,
          });
          continue;
        }

        const def = techDb.indexed[tech.id as AllowedKeys];
        techs.set(def.key, def);
      }

      if (child.techId && !techs.has(child.techId)) {
        const def = techDb.indexed[child.techId as AllowedKeys];
        techs.set(def.key, def);
      }
    }
    // l.info({ size: dependencies.size }, 'Preparing stack for ES');
    l.info({ size: techs.size }, 'Preparing stack for ES');

    await Promise.all([
      this.indexTech({
        job,
        techs: Array.from(techs.values()),
      }),
      // indexDependencies({
      //   project,
      //   dependencies: Array.from(dependencies.values()),
      // }),
    ]);

    l.info('Cleaning old data');
    await client.deleteByQuery({
      index: 'techs',

      // In production we do not care that ES is cleaned synchronously
      wait_for_completion: false,
      // It will ignore all conflicts on document
      conflicts: 'proceed',
      // Make sure shards refresh after the delete
      refresh: isTest === true,
      query: {
        // @ts-expect-error
        bool: {
          must: [
            {
              term: {
                projectId: job.projectId,
              },
            },
          ],
          must_not: [
            {
              term: {
                jobId: job.id,
              },
            },
          ],
        },
      },
    });
    l.info('Cleaned');

    this.mark('success', 'success');
  }

  /**
   * Clean up
   */
  async teardown(): Promise<void> {
    // nothing
  }

  private async indexTech({
    job,
    techs,
  }: {
    job: JobWithOrgProject;
    techs: Tech[];
  }) {
    const l = this.l;
    const operations = techs.flatMap((tech) => [
      { index: { _index: 'techs', _id: nanoid(20) } },
      {
        orgId: job.orgId,
        projectId: job.projectId,
        jobId: job.id,
        ...tech,
      },
    ]);
    const bulkResponse = await client.bulk({ refresh: true, operations });

    l.info({ size: operations.length }, 'Indexing techs to ES');

    if (bulkResponse.errors) {
      bulkResponse.items.forEach((action) => {
        l.error(action);
      });
    }
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
