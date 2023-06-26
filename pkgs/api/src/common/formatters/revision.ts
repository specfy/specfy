import type { ApiRevision, BlockLevelZero } from '../../types/api/index.js';
import type {
  RevisionWithProject,
  TypeHasUsersWithUser,
} from '../../types/db/index.js';
import { env } from '../env.js';

import { toApiUser } from './user.js';

export function toApiRevision(
  rev: RevisionWithProject,
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
    url: `${env('APP_HOSTNAME')}/${rev.orgId}/${rev.Project.slug}/revisions/${
      rev.id
    }`,
    createdAt: rev.createdAt.toISOString(),
    updatedAt: rev.updatedAt.toISOString(),
    mergedAt: rev.mergedAt ? rev.mergedAt.toISOString() : null,
    closedAt: rev.closedAt ? rev.closedAt.toISOString() : null,
  };
}
