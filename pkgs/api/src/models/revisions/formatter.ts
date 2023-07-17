import { env } from '../../common/env.js';
import type { ApiRevision } from '../../types/api/index.js';
import type { TypeHasUsersWithUser } from '../typesHasUsers/types.js';
import { toApiUser } from '../users/formatter.js';

import type { RevisionWithProject } from './types.js';

export function toApiRevision(
  rev: RevisionWithProject,
  users: TypeHasUsersWithUser[]
): ApiRevision {
  return {
    id: rev.id,
    orgId: rev.orgId,
    projectId: rev.projectId,
    name: rev.name,
    description: rev.description,
    locked: rev.locked,
    merged: rev.merged,
    status: rev.status,
    blobs: rev.blobs,
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
