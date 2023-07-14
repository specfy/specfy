import type { Orgs } from '@prisma/client';
import type { FastifyRequest } from 'fastify';

export function getOrgFromRequest(
  req: FastifyRequest,
  orgId: string
): Orgs | undefined {
  return req.perms!.find((p) => p.orgId === orgId && p.projectId === null)?.Org;
}

export function checkInheritedPermissions(
  req: FastifyRequest,
  orgId: string,
  projectId?: string
) {
  const exactMatch = req.perms!.find((perm) => {
    return (
      perm.orgId === orgId &&
      (projectId ? perm.projectId === projectId : perm.projectId === null)
    );
  });
  if (exactMatch) {
    return true;
  }

  if (projectId) {
    const inherited = req.perms!.find((perm) => {
      return perm.orgId === orgId;
    });
    if (inherited?.Org.Projects.find((project) => project.id === projectId)) {
      return true;
    }
  }

  return false;
}
