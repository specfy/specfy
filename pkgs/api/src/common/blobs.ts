import type {
  Blobs,
  Components,
  Documents,
  Prisma,
  Projects,
} from '@prisma/client';

import { isDocumentBlob, isComponentBlob, isProjectBlob } from '../types/db';

export type IterateBlob = {
  blob: Blobs;
  parent: Components | Documents | Projects | null;
};

export async function findAllBlobsWithParent(
  blobIds: string[],
  tx: Prisma.TransactionClient,
  willUpdate?: true
): Promise<IterateBlob[]> {
  const list: IterateBlob[] = [];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const lock = willUpdate ? 'UPDATE' : 'SHARE';
  const blobs = await tx.blobs.findMany({
    where: {
      id: { in: blobIds },
    },
    orderBy: { createdAt: 'asc' },
    take: 200,
    // TODO: add back lock?
    // lock: Transaction.LOCK.UPDATE,
  });

  // Update all blobs
  for (const blob of blobs) {
    if (!blob.parentId) {
      list.push({ blob, parent: null });
      continue;
    }

    if (isDocumentBlob(blob)) {
      const parent = await tx.documents.findFirst({
        where: { blobId: blob.parentId },
        // TODO: add back lock?
        // lock: Transaction.LOCK[lock],
      });

      list.push({ blob, parent });
    } else if (isComponentBlob(blob)) {
      const parent = await tx.components.findFirst({
        where: { blobId: blob.parentId },
        // TODO: add back lock?
        // lock: Transaction.LOCK[lock],
      });

      list.push({ blob, parent });
    } else if (isProjectBlob(blob)) {
      const parent = await tx.projects.findFirst({
        where: { blobId: blob.parentId },
        // TODO: add back lock?
        // lock: Transaction.LOCK[lock],
      });

      list.push({ blob, parent });
    } else {
      throw new Error('unsupported blob type');
    }
  }

  return list;
}
