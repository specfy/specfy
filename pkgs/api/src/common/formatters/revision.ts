import type { Revision, TypeHasUser } from '../../models';
import type { ApiRevision } from '../../types/api/revisions';

import { toApiUser } from './user';

export function toApiRevision(
  rev: Revision,
  users: TypeHasUser[]
): ApiRevision {
  return {
    id: rev.id,
    orgId: rev.orgId,
    projectId: rev.projectId,
    title: rev.title,
    description: rev.description,
    locked: rev.locked,
    merged: rev.merged,
    status: rev.status,
    blobs: rev.blobs,
    authors: users
      .filter((user) => user.role === 'author')
      .map((u) => toApiUser(u.user)),
    createdAt: rev.createdAt.toISOString(),
    updatedAt: rev.updatedAt.toISOString(),
    mergedAt: rev.mergedAt ? rev.mergedAt.toISOString() : null,
    closedAt: rev.closedAt ? rev.closedAt.toISOString() : null,
  };
}
