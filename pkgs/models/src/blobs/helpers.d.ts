import type { Blobs, Components, Documents, Prisma, Projects } from '@specfy/db';
export type IterateBlob = {
    blob: Blobs;
    parent: Components | Documents | Projects | null;
};
export declare function findAllBlobsWithParent(blobIds: string[], tx: Prisma.TransactionClient, willUpdate?: true): Promise<IterateBlob[]>;
