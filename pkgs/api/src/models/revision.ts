import type { Prisma, Users, Activities, Revisions } from '@prisma/client';

import { nanoid } from '../common/id.js';
import type { ApiBlobCreate } from '../types/api/revisions.js';
import type { ActionRevision } from '../types/db/index.js';

export async function createRevisionActivity({
  user,
  action,
  target,
  tx,
  activityGroupId = null,
}: {
  user: Users;
  action: ActionRevision;
  target: Revisions;
  tx: Prisma.TransactionClient;
  activityGroupId?: string | null;
}): Promise<Activities> {
  return await tx.activities.create({
    data: {
      id: nanoid(),
      action,
      userId: user.id,
      orgId: target.orgId,
      projectId: target.projectId,
      activityGroupId,
      targetRevisionId: target.id,
      createdAt: new Date(),
    },
  });
}

export async function createBlobs(
  blobs: ApiBlobCreate[],
  tx: Prisma.TransactionClient
): Promise<string[]> {
  const ids: string[] = [];

  for (const blob of blobs) {
    const b = await tx.blobs.create({
      data: {
        id: nanoid(),
        ...blob,
        current: blob.current ? (blob.current as any) : undefined,
      },
    });
    ids.push(b.id);
  }
  return ids;
}
