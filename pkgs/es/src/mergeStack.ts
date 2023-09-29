import { l, nanoid } from '@specfy/core';
import { tech } from '@specfy/stack-analyser';

import type { Projects } from '@specfy/db';
import type {
  Dependency,
  TechType,
  AnalyserJson,
} from '@specfy/stack-analyser';

import { client } from './client.js';

type Tech = { type: TechType; name: string };

export async function mergeStack({
  project,
  stack,
}: {
  project: Projects;
  stack: AnalyserJson;
}) {
  const dependencies = new Map<string, Dependency>();
  const techs = new Map<string, Tech>();

  for (const child of stack.childs) {
    // Deduplicate dependencies
    for (const dep of child.dependencies) {
      const key = dep.join('|');
      dependencies.set(key, dep);
    }

    // Deduplicate techs
    for (const name of child.techs) {
      if (techs.has(name)) {
        continue;
      }

      const def = tech.indexed[name];
      techs.set(name, { name, type: def.type });
    }
    if (child.tech && !techs.has(child.tech)) {
      const def = tech.indexed[child.tech];
      techs.set(child.tech, { name: def.key, type: def.type });
    }
  }
  l.info({ size: dependencies.size }, 'Preparing stack for ES');

  await Promise.all([
    indexTech({
      project,
      techs: Array.from(techs.values()),
    }),
    indexDependencies({
      project,
      dependencies: Array.from(dependencies.values()),
    }),
  ]);
}

async function indexTech({
  project,
  techs,
}: {
  project: Projects;
  techs: Dependency[];
}) {
  const operations = dependencies.flatMap((doc) => [
    { index: { _index: 'dependencies', _id: nanoid(20) } },
    {
      orgId: project.orgId,
      projectId: project.id,
      type: doc[0],
      name: doc[1],
      version: doc[2],
    },
  ]);
  const bulkResponse = await client.bulk({ refresh: true, operations });

  l.info({ size: operations.length }, 'Indexing dependencies to ES');

  if (bulkResponse.errors) {
    bulkResponse.items.forEach((action) => {
      l.error(action);
    });
  }
}

async function indexDependencies({
  project,
  dependencies,
}: {
  project: Projects;
  dependencies: Dependency[];
}) {
  const operations = dependencies.flatMap((doc) => [
    { index: { _index: 'dependencies', _id: nanoid(20) } },
    {
      orgId: project.orgId,
      projectId: project.id,
      type: doc[0],
      name: doc[1],
      version: doc[2],
    },
  ]);
  const bulkResponse = await client.bulk({ refresh: true, operations });

  l.info({ size: operations.length }, 'Indexing dependencies to ES');

  if (bulkResponse.errors) {
    bulkResponse.items.forEach((action) => {
      l.error(action);
    });
  }
}
