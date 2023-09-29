import type { Projects } from '@specfy/db';

import type { ApiProject, ListProjects } from '../projects';

export function toApiProject(proj: Projects): ApiProject {
  return {
    id: proj.id,
    orgId: proj.orgId,
    blobId: proj.blobId,
    description: proj.description,
    name: proj.name,
    slug: proj.slug,
    links: proj.links,
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
    createdAt: proj.createdAt.toISOString(),
    updatedAt: proj.updatedAt.toISOString(),
    users: proj._count.Perms,
  };
}
