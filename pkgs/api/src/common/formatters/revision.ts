import type { Revisions } from '@prisma/client';

import type { ApiRevision, BlockLevelZero } from '../../types/api';
import type { TypeHasUsersWithUser } from '../../types/db';

import { toApiUser } from './user';

export function toApiRevision(
  rev: Revisions,
  users: TypeHasUsersWithUser[]
): ApiRevision {
  return {
    id: rev.id,
    orgId: rev.orgId,
    projectId: rev.projectId,
    name: rev.name,
    description: rev.description as unknown as BlockLevelZero,
    locked: rev.locked,
    merged: rev.merged,
    status: rev.status as ApiRevision['status'],
    blobs: rev.blobs as string[],
    authors: users
      .filter((user) => user.role === 'author')
      .map((u) => toApiUser(u.User)),
    createdAt: rev.createdAt.toISOString(),
    updatedAt: rev.updatedAt.toISOString(),
    mergedAt: rev.mergedAt ? rev.mergedAt.toISOString() : null,
    closedAt: rev.closedAt ? rev.closedAt.toISOString() : null,
  };
}
