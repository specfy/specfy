import { Prisma } from '@prisma/client';
import type { Users, Activities, Revisions } from '@prisma/client';

import { nanoid } from '../common/id';
import type { ApiBlobCreate } from '../types/api';
import type { ActionRevision } from '../types/db';

export async function createRevisionActivity(
  user: Users,
  action: ActionRevision,
  target: Revisions,
  tx: Prisma.TransactionClient
): Promise<Activities> {
  const activityGroupId = nanoid();

  return await tx.activities.create({
    data: {
      id: nanoid(),
      action,
      userId: user.id,
      orgId: target.orgId,
      projectId: target.projectId,
      activityGroupId,
      targetRevisionId: target.id,
    },
  });
}

export async function createBlobs(
  blobs: ApiBlobCreate[],
  tx: Prisma.TransactionClient
): Promise<string[]> {
  const ids: string[] = [];

  for (const blob of blobs) {
    let blobToModel: any | typeof Prisma.DbNull = Prisma.DbNull;

    if (!blob.deleted && blob.blob) {
      blobToModel = blob.blob as any;
    }

    // TODO: validation
    const b = await tx.blobs.create({
      data: {
        id: nanoid(),
        ...blob,
        blob: blobToModel,
      },
    });
    ids.push(b.id);
  }
  return ids;
}
