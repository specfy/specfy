import type { Prisma } from '@specfy/db';

export enum PermType {
  'contributor' = 'contributor',
  'owner' = 'owner',
  'reviewer' = 'reviewer',
  'viewer' = 'viewer',
}

export interface DBPerm {
  id: string;
  orgId: string;
  projectId: string | null;

  userId: string;
  role: 'contributor' | 'owner' | 'reviewer' | 'viewer';

  createdAt: string;
  updatedAt: string;
}

export type PermsWithOrg = Prisma.PermsGetPayload<{
  include: { Org: { include: { Projects: { select: { id: true } } } } };
}>;

export type PermsWithUser = Prisma.PermsGetPayload<{
  include: { User: true };
}>;
