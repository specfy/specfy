import { sortBlobsByInsertion } from '../revisions/helpers.js';
import { isComponentBlob, isDocumentBlob, isProjectBlob } from './types.js';
export async function findAllBlobsWithParent(blobIds, tx, willUpdate) {
    const list = [];
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
        }
        else if (isComponentBlob(blob)) {
            const parent = await tx.components.findFirst({
                where: { blobId: blob.parentId },
            });
            list.push({ blob, parent });
        }
        else if (isProjectBlob(blob)) {
            const parent = await tx.projects.findFirst({
                where: { blobId: blob.parentId },
            });
            list.push({ blob, parent });
        }
        else {
            throw new Error('unsupported blob type');
        }
    }
    return list;
}
