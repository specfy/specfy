import type { Orgs, Perms } from '@specfy/db';
import type { FastifyRequest } from 'fastify';
import type { DBPerm, PermsWithOrg } from './types.js';
export declare function getOrgFromRequest(req: FastifyRequest, orgId: string): Orgs | undefined;
export declare function checkInheritedPermissions(perms: PermsWithOrg[], role: DBPerm['role'], orgId: string, projectId?: string): boolean;
export declare function isRoleOrAbove(perm: Perms, role: DBPerm['role']): boolean;
