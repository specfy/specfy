import type {
  Blobs,
  Components,
  Documents,
  Prisma,
  Projects,
} from '@prisma/client';

import {
  isDocumentBlob,
  isComponentBlob,
  isProjectBlob,
} from '../../types/db/index.js';
import { sortBlobsByInsertion } from '../revisions/helpers.js';

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
  });

  const sorted = sortBlobsByInsertion(blobIds, blobs);

  // Update all blobs
  for (const blob of sorted) {
    if (!blob.parentId) {
      list.push({ blob, parent: null });
      continue;
    }

    if (isDocumentBlob(blob)) {
      const parent = await tx.documents.findFirst({
        where: { blobId: blob.parentId },
      });

      list.push({ blob, parent });
    } else if (isComponentBlob(blob)) {
      const parent = await tx.components.findFirst({
        where: { blobId: blob.parentId },
      });

      list.push({ blob, parent });
    } else if (isProjectBlob(blob)) {
      const parent = await tx.projects.findFirst({
        where: { blobId: blob.parentId },
      });

      list.push({ blob, parent });
    } else {
      throw new Error('unsupported blob type');
    }
  }

  return list;
}
