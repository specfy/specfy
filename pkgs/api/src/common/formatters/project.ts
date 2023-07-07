import type { Projects } from '@prisma/client';

import type { ApiProject, BlockLevelZero } from '../../types/api/index.js';
import type { DBProjectLink } from '../../types/db/index.js';

export function toApiProject(proj: Projects): ApiProject {
  return {
    id: proj.id,
    orgId: proj.orgId,
    blobId: proj.blobId,
    description: proj.description as unknown as BlockLevelZero,
    name: proj.name,
    slug: proj.slug,
    links: proj.links as unknown as DBProjectLink[], // TODO: remove this in /list
    githubRepository: proj.githubRepository,
    createdAt: proj.createdAt.toISOString(),
    updatedAt: proj.updatedAt.toISOString(),
  };
}
