import type { Blobs, Prisma } from '@specfy/db';

import type { ApiBlobCreate } from './types.api.js';

/**
 * Determine if we the revision has modified a project<>project edge.
 * If true, we need to recompute the organization graph
 */
export async function hasProjectComponentChanges(
  projectId: string,
  blobs: ApiBlobCreate[],
  tx: Prisma.TransactionClient
): Promise<boolean> {
  // Early return, if some blobs modify a project we need to recompute
  for (const blob of blobs) {
    if (blob.type === 'component' && blob.current.type === 'project') {
      return true;
    }
  }

  // Since we only do partial update, we need to select all components of this project to be sure an edge to a project was not updated
  const components = await tx.components.findMany({
    where: { projectId },
    select: { id: true, type: true, edges: true },
  });

  const componentIds: string[] = [];
  for (const component of components) {
    if (component.type === 'project') {
      componentIds.push(component.id);
    }
  }

  // There is no project components in this project
  if (componentIds.length > 0) {
    return true;
  }

  // If a component that was modified has an edge to a project component we need to recompute
  return (
    components.find((component) => {
      return component.edges.find((edge) => componentIds.includes(edge.target));
    }) !== undefined
  );
}

/**
 * Allow to keep order of Blobs insertion because it's required to perform an insert since we can't delay Foreign Key check with prisma.
 */
export function sortBlobsByInsertion(
  blobIds: string[],
  blobs: Blobs[]
): Blobs[] {
  const orderMap: Record<string, Blobs> = {};
  for (const blob of blobs) {
    orderMap[blobIds.indexOf(blob.id)] = blob;
  }

  return Object.values(orderMap);
}
