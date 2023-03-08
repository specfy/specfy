import { Transaction } from 'sequelize';

import type { RevisionBlob } from '../models';
import { Project, Component, Document } from '../models';
import { isDocumentBlob, isComponentBlob, isProjectBlob } from '../types/db';

export async function iterate(
  blobs: RevisionBlob[],
  cb: (
    blob: RevisionBlob,
    parent: Component | Document | Project | null
  ) => Promise<void>,
  transaction: Transaction
): Promise<void> {
  // Update all blobs
  for (const blob of blobs) {
    if (isDocumentBlob(blob)) {
      const parent = await Document.findOne({
        where: { blobId: blob.parentId },
        lock: Transaction.LOCK.SHARE,
        transaction,
      });

      await cb(blob, parent);
    } else if (isComponentBlob(blob)) {
      const parent = await Component.findOne({
        where: { blobId: blob.parentId },
        lock: Transaction.LOCK.SHARE,
        transaction,
      });

      await cb(blob, parent);
    } else if (isProjectBlob(blob)) {
      const parent = await Project.findOne({
        where: { blobId: blob.parentId },
        lock: Transaction.LOCK.SHARE,
        transaction,
      });

      await cb(blob, parent);
    } else {
      console.error('unsupported blob');
    }
  }
}
