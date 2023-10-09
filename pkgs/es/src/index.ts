import { l as logger } from '@specfy/core';

import { client } from './client.js';

import type { estypes } from '@elastic/elasticsearch';

export { client };

const l = logger.child({ svc: 'es' });

const indices: estypes.IndicesCreateRequest[] = [
  {
    index: 'dependencies',
    mappings: {
      properties: {
        orgId: { type: 'keyword' },
        projectId: { type: 'keyword' },
        sourceId: { type: 'keyword' },
        type: { type: 'keyword' },
        name: { type: 'keyword' },
        version: { type: 'keyword' },
      },
    },
  },
  {
    index: 'techs',
    mappings: {
      properties: {
        orgId: { type: 'keyword' },
        projectId: { type: 'keyword' },
        jobId: { type: 'keyword' },
        type: { type: 'keyword' },
        key: { type: 'keyword' },
        name: { type: 'keyword' },
      },
    },
  },
];

export async function start() {
  l.info('ES Service Starting');
}

export async function mapping() {
  try {
    await Promise.all(
      indices.map((index) => {
        return client.indices.create(index, { ignore: [400] });
      })
    );
  } catch (err) {
    l.error(err);
    throw new Error('Error in es init()');
  }
}
