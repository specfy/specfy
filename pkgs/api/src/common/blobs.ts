import { Transaction } from 'sequelize';

import { RevisionBlob, Project, Component, Document } from '../models';
import { isDocumentBlob, isComponentBlob, isProjectBlob } from '../types/db';

export type IterateBlob = {
  blob: RevisionBlob;
  parent: Component | Document | Project | null;
};

export async function findAllBlobsWithParent(
  blobIds: string[],
  transaction: Transaction,
  willUpdate?: true
): Promise<IterateBlob[]> {
  const list: IterateBlob[] = [];

  const lock = willUpdate ? 'UPDATE' : 'SHARE';
  const blobs = await RevisionBlob.findAll({
    where: {
      id: blobIds,
    },
    order: [['createdAt', 'ASC']],
    limit: 200,
    lock: Transaction.LOCK.UPDATE,
    transaction,
  });

  // Update all blobs
  for (const blob of blobs) {
    if (isDocumentBlob(blob)) {
      const parent = await Document.findOne({
        where: { blobId: blob.parentId },
        lock: Transaction.LOCK[lock],
        transaction,
      });

      list.push({ blob, parent });
    } else if (isComponentBlob(blob)) {
      const parent = await Component.findOne({
        where: { blobId: blob.parentId },
        lock: Transaction.LOCK[lock],
        transaction,
      });

      list.push({ blob, parent });
    } else if (isProjectBlob(blob)) {
      const parent = await Project.findOne({
        where: { blobId: blob.parentId },
        lock: Transaction.LOCK[lock],
        transaction,
      });

      list.push({ blob, parent });
    } else {
      throw new Error('unsupported blob type');
    }
  }

  return list;
}
