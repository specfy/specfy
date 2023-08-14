import type { Blobs, Prisma } from '@specfy/db';
import type { ApiBlobCreate } from './types.api.js';
/**
 * Determine if we the revision has modified a project<>project edge.
 * If true, we need to recompute the organization graph
 */
export declare function hasProjectComponentChanges(projectId: string, blobs: ApiBlobCreate[], tx: Prisma.TransactionClient): Promise<boolean>;
/**
 * Allow to keep order of Blobs insertion because it's required to perform an insert since we can't delay Foreign Key check with prisma.
 */
export declare function sortBlobsByInsertion(blobIds: string[], blobs: Blobs[]): Blobs[];
