import type { Orgs, Perms } from '@prisma/client';
import type { FastifyRequest } from 'fastify';

import type { DBPerm, PermsWithOrg } from './types.js';

export function getOrgFromRequest(
  req: FastifyRequest,
  orgId: string
): Orgs | undefined {
  return req.perms!.find((p) => p.orgId === orgId && p.projectId === null)?.Org;
}

export function checkInheritedPermissions(
  perms: PermsWithOrg[],
  role: DBPerm['role'],
  orgId: string,
  projectId?: string
) {
  const exactMatch = perms!.find((perm) => {
    return (
      perm.orgId === orgId &&
      (projectId ? perm.projectId === projectId : perm.projectId === null)
    );
  });
  if (exactMatch) {
    return isRoleOrAbove(exactMatch, role);
  }

  if (projectId) {
    const inherited = perms!.find((perm) => {
      return perm.orgId === orgId;
    });
    if (inherited?.Org.Projects.find((project) => project.id === projectId)) {
      return isRoleOrAbove(inherited, role);
    }
  }

  return false;
}

export function isRoleOrAbove(perm: Perms, role: DBPerm['role']) {
  return perm.role === role || perm.role === 'owner' || role === 'viewer';
}
