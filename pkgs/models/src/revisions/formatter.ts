import { envs } from '@specfy/core';

import type { ApiRevision, ApiRevisionList } from '../revisions';
import { toApiUser } from '../users/formatter.js';

import type { RevisionWithProject } from './types.js';

export function toApiRevisionList(rev: RevisionWithProject): ApiRevisionList {
  return {
    id: rev.id,
    orgId: rev.orgId,
    projectId: rev.projectId,
    name: rev.name,
    locked: rev.locked,
    merged: rev.merged,
    status: rev.status,
    blobs: rev.blobs,
    authors: rev.TypeHasUsers.filter((user) => user.role === 'author').map(
      (u) => toApiUser(u.User)
    ),
    url: `${envs.APP_HOSTNAME}/${rev.orgId}/${rev.Project.slug}/revisions/${rev.id}`,
    createdAt: rev.createdAt.toISOString(),
    updatedAt: rev.updatedAt.toISOString(),
    mergedAt: rev.mergedAt ? rev.mergedAt.toISOString() : null,
    closedAt: rev.closedAt ? rev.closedAt.toISOString() : null,
  };
}

export function toApiRevision(rev: RevisionWithProject): ApiRevision {
  return {
    ...toApiRevisionList(rev),
    description: rev.description,
    stack: rev.stack,
  };
}
