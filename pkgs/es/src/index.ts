import { Client } from '@elastic/elasticsearch';
import { envs, l, nanoid } from '@specfy/core';

import type { Projects } from '@specfy/db';
import type { AnalyserJson } from '@specfy/stack-analyser';

export const client = new Client({
  nodes: envs.ELASTICSEARCH_HOST,
  requestTimeout: 5000,
  maxRetries: 1,
});

export async function initElasticsearch() {
  try {
    await client.indices.create(
      {
        index: 'dependencies',
        mappings: {
          properties: {
            orgId: { type: 'text' },
            projectId: { type: 'text' },
            type: { type: 'text' },
            name: { type: 'text' },
            version: { type: 'text' },
          },
        },
      },
      { ignore: [400] }
    );
  } catch (err) {
    l.error(err);
    throw new Error('Error in es init()');
  }
}

export async function insertDependencies({
  project,
  stack,
}: {
  project: Projects;
  stack: AnalyserJson;
}) {
  // Missing file provenance
  const dedup = new Map<string, AnalyserJson['dependencies'][0]>();
  for (const child of stack.childs) {
    for (const dep of child.dependencies) {
      const key = dep.join('|');
      dedup.set(key, dep);
    }
  }
  l.info({ size: dedup.size }, 'Preparing dependencies to ES');

  const deps = Array.from(dedup.values());
  const operations = deps.flatMap((doc) => [
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

  l.info({ size: operations.length }, 'Sending dependencies to ES');

  if (bulkResponse.errors) {
    bulkResponse.items.forEach((action) => {
      l.error(action);
    });
  }
}
