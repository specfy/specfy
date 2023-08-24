import type { Documents } from '@specfy/db';

import type { TypeHasUsersWithUser } from '../typesHasUsers';
import { toApiUser } from '../users/index.js';

import type { ApiDocument } from './types.api.js';

export function toApiDocument(
  p: Documents,
  users: TypeHasUsersWithUser[]
): ApiDocument {
  return {
    id: p.id,
    orgId: p.orgId,
    projectId: p.projectId,
    blobId: p.blobId,

    type: p.type,
    typeId: p.typeId,

    source: p.source,
    sourcePath: p.sourcePath,
    parentId: p.parentId,

    name: p.name,
    slug: p.slug,
    tldr: p.tldr,
    content: p.content,
    authors: users
      .filter((user) => user.role === 'author')
      .map((u) => toApiUser(u.User!)),
    reviewers: users
      .filter((user) => user.role === 'reviewer')
      .map((u) => toApiUser(u.User!)),
    // TODO: fill this
    approvedBy: [],
    locked: p.locked,

    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}
