import type { Projects } from '@prisma/client';

import type { ApiProject } from '../../types/api/index.js';

export function toApiProject(proj: Projects): ApiProject {
  return {
    id: proj.id,
    orgId: proj.orgId,
    blobId: proj.blobId,
    description: proj.description,
    name: proj.name,
    slug: proj.slug,
    links: proj.links, // TODO: remove this in /list
    githubRepository: proj.githubRepository,
    createdAt: proj.createdAt.toISOString(),
    updatedAt: proj.updatedAt.toISOString(),
  };
}
