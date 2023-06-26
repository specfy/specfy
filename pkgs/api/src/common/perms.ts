import type { Orgs } from '@prisma/client';
import type { FastifyRequest } from 'fastify';

export function getOrgFromRequest(
  req: FastifyRequest,
  orgId: string
): Orgs | undefined {
  return req.perms!.find((p) => p.orgId === orgId && p.projectId === null)?.Org;
}
