import { isTest, l as logger } from '@specfy/core';

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
  {
    index: 'tech_usage',
    mappings: {
      properties: {
        orgId: { type: 'keyword' },
        projectId: { type: 'keyword' },
        sourceId: { type: 'keyword' },
        hash: { type: 'keyword' },
        techs: { type: 'keyword' },
        date: { type: 'date' },
        authors: {
          type: 'object',
          properties: {
            id: { type: 'keyword' },
            name: { type: 'keyword' },
            email: { type: 'keyword' },
          },
        },
      },
    },
  },
];

export const baseDelete = {
  // In production we do not care that ES is cleaned synchronously
  wait_for_completion: false,
  // It will ignore all conflicts on document
  conflicts: 'proceed',
  // Make sure shards refresh after the delete
  refresh: isTest === true,
};

export async function start() {
  l.info('ES Service Starting');

  await mapping();
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
