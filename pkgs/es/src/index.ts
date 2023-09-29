import { l } from '@specfy/core';

import { client } from './client.js';

import type { estypes } from '@elastic/elasticsearch';

export { client };

const indices: estypes.IndicesCreateRequest[] = [
  {
    index: 'dependencies',
    mappings: {
      properties: {
        orgId: { type: 'text' },
        projectId: { type: 'text' },
        sourceId: { type: 'text' },
        type: { type: 'text' },
        name: { type: 'text' },
        version: { type: 'text' },
      },
    },
  },
  {
    index: 'tech',
    mappings: {
      properties: {
        orgId: { type: 'text' },
        projectId: { type: 'text' },
        jobId: { type: 'text' },
        type: { type: 'text' },
        name: { type: 'text' },
      },
    },
  },
];

export async function start() {
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
