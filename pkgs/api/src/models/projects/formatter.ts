import type { Projects } from '@prisma/client';

import type { ApiProject, ListProjects } from '../../types/api/index.js';

export function toApiProject(proj: Projects): ApiProject {
  return {
    id: proj.id,
    orgId: proj.orgId,
    blobId: proj.blobId,
    description: proj.description,
    name: proj.name,
    slug: proj.slug,
    links: proj.links,
    config: proj.config,
    githubRepository: proj.githubRepository,
    createdAt: proj.createdAt.toISOString(),
    updatedAt: proj.updatedAt.toISOString(),
  };
}

export function toApiProjectList(
  proj: Projects & { _count: { Perms: number } }
): ListProjects['Success']['data'][0] {
  return {
    id: proj.id,
    orgId: proj.orgId,
    name: proj.name,
    slug: proj.slug,
    githubRepository: proj.githubRepository,
    createdAt: proj.createdAt.toISOString(),
    updatedAt: proj.updatedAt.toISOString(),
    users: proj._count.Perms,
  };
}
