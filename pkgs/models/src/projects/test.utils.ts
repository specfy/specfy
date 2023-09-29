import { nanoid, slugify } from '@specfy/core';

import type { Orgs } from '@specfy/db';

import type { DBProject } from './types.js';
import type { ApiBlobProject } from '../blobs/types.api.js';

export function getBlobProject(org: Pick<Orgs, 'id'>): DBProject {
  const id = nanoid();
  const name = `test ${id}`;
  return {
    id,
    orgId: org.id,
    name,
    slug: slugify(name),
    blobId: null,
    description: { type: 'doc', content: [] },
    links: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getApiBlobProject(org: Pick<Orgs, 'id'>): ApiBlobProject {
  const comp = getBlobProject(org);
  return {
    id: nanoid(),
    created: true,
    current: comp,
    deleted: false,
    type: 'project',
    typeId: comp.id,
    previous: null,
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
