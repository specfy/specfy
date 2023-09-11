import { nanoid, slugify } from '@specfy/core';
import type { Projects } from '@specfy/db';

import type { ApiBlobDocument } from '../blobs/types.api.js';

import type { DBDocument } from './types.js';

export function getBlobDocument(
  project: Pick<Projects, 'id' | 'orgId'>
): DBDocument {
  const id = nanoid();
  const name = `test ${id}`;
  return {
    id,
    orgId: project.orgId,
    projectId: project.id,
    name,
    slug: slugify(name),
    blobId: null,
    type: 'doc',
    format: 'pm',
    content: JSON.stringify({ type: 'doc', content: [] }),
    hash: 'aaa',
    locked: false,
    parentId: null,
    source: null,
    sourcePath: null,
    tldr: '',
    typeId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getApiBlobDocument(
  project: Pick<Projects, 'id' | 'orgId'>
): ApiBlobDocument {
  const comp = getBlobDocument(project);
  return {
    id: nanoid(),
    created: true,
    current: comp,
    deleted: false,
    type: 'document',
    typeId: comp.id,
    previous: null,
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
