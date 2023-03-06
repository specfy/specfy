import type { Project } from '../../models';
import type { ApiProject } from '../../types/api';

export function toApiProject(proj: Project): ApiProject {
  return {
    id: proj.id,
    orgId: proj.orgId,
    blobId: proj.blobId,
    description: proj.description,
    name: proj.name,
    slug: proj.slug,
    links: proj.links, // TODO: remove this in /list
    display: proj.display,
    edges: proj.edges,
    createdAt: proj.createdAt.toISOString(),
    updatedAt: proj.updatedAt.toISOString(),
  };
}
