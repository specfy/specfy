import { nanoid, slugify } from '@specfy/core';
import type { Orgs, Projects } from '@specfy/db';

import type { DBComponent } from './types';

export function getBlobComponent(org: Orgs, project: Projects): DBComponent {
  const id = nanoid();
  const name = `test ${id}`;
  return {
    id,
    name,
    slug: slugify(name),
    type: 'service',
    typeId: null,
    orgId: org.id,
    projectId: project.id,
    blobId: null,
    techId: null,
    description: { type: 'doc', content: [] },
    display: {
      zIndex: 1,
      pos: { x: 0, y: 0 },
      size: { width: 130, height: 40 },
    },
    techs: [],
    inComponent: null,
    edges: [],
    source: null,
    sourceName: null,
    sourcePath: [],
    tags: [],
    show: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
