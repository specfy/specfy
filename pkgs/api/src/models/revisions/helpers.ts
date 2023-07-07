import type { Prisma } from '@prisma/client';

import {
  createNodeFromProject,
  getEdgeMarkers,
} from '../../common/flow/transform.js';
import type { ComputedFlow } from '../../common/flow/types.js';
import {
  computeNewProjectPosition,
  getComponentSize,
} from '../../common/flow.js';
import { nanoid } from '../../common/id.js';
import type { ApiBlobCreate } from '../../types/api/revisions.js';
import type { DBComponent, FlowItemDisplay } from '../../types/db/index.js';

type ProjectRelation = {
  from: { read: boolean; write: boolean };
  to: { read: boolean; write: boolean };
};

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
      return (component.edges as unknown as DBComponent['edges']).find((edge) =>
        componentIds.includes(edge.target)
      );
    }) !== undefined
  );
}

/**
 * Completely recompute the organization graph's edges.
 * Output an up to date map of all edges.
 */
export async function recomputeOrgGraph({
  orgId,
  updates,
  tx,
}: {
  orgId: string;
  updates?: Record<string, { display: FlowItemDisplay }>;
  tx: Prisma.TransactionClient;
}) {
  const projects = await tx.projects.findMany({
    where: { orgId: orgId },
    select: { id: true, name: true },
  });

  // Compute relations project by project
  // Instead of selecting all components from the org because that could be huge (if this project work someday)
  const relations: Record<string, Record<string, ProjectRelation['to']>> = {};
  for (const project of projects) {
    const components = (await tx.components.findMany({
      where: { projectId: project.id },
      select: { id: true, edges: true, type: true, typeId: true },
    })) as unknown as Array<
      Pick<DBComponent, 'edges' | 'id' | 'type' | 'typeId'>
    >;

    const rels = computeRelationsToProjects({
      components,
    });

    for (const [projectId, rel] of Object.entries(rels)) {
      if (rel.from.read || rel.from.write) {
        if (!relations[projectId]) {
          relations[projectId] = {};
        }
        relations[projectId][project.id] = rel.from;
      }
      if (rel.to.read || rel.to.write) {
        if (!relations[project.id]) {
          relations[project.id] = {};
        }
        relations[project.id][projectId] = rel.to;
      }
    }
  }

  // Try to find the old snapshot to keep the position and display
  const snapshot = await tx.flows.findFirst({
    where: { orgId: orgId },
  });

  const oldFlow = snapshot?.flow as ComputedFlow | null;
  const newFlow: ComputedFlow = {
    edges: [],
    nodes: [],
  };

  // Rebuild the whole snapshot
  for (const project of projects) {
    const prevNode = oldFlow?.nodes.find((nd) => nd.id === project.id);
    const update = updates?.[project.id];
    let node: ComputedFlow['nodes'][0];

    if (prevNode) {
      node = createNodeFromProject(
        project,
        update?.display || {
          pos: prevNode.position,
          size: prevNode.data.originalSize,
        }
      );
    } else {
      node = createNodeFromProject(
        project,
        update?.display || {
          // TODO: place it better
          pos: computeNewProjectPosition(oldFlow || newFlow),
          size: getComponentSize('project', project.name),
        }
      );
    }
    newFlow.nodes.push(node);

    if (!relations[project.id]) {
      continue;
    }

    for (const [targetId, opts] of Object.entries(relations[project.id])) {
      const id = `${project.id}->${targetId}`;
      const prevEdge = oldFlow?.edges.find((ed) => ed.id === id);
      let edge: ComputedFlow['edges'][0];

      if (prevEdge) {
        edge = { ...prevEdge, data: opts };
      } else {
        edge = {
          id,
          source: project.id,
          target: targetId,
          sourceHandle: 'sr',
          targetHandle: 'tl',
          data: opts,
          ...getEdgeMarkers(opts),
        };
      }
      newFlow.edges.push(edge);
    }
  }

  if (snapshot) {
    await tx.flows.update({
      where: { id: snapshot.id },
      data: { flow: newFlow as any },
    });
  } else {
    await tx.flows.create({
      data: { id: nanoid(), orgId, flow: newFlow as any },
    });
  }
}

/**
 * Compute one project relations to any projects inside the same project.
 */
export function computeRelationsToProjects({
  components,
}: {
  components: Array<Pick<DBComponent, 'edges' | 'id' | 'type' | 'typeId'>>;
}) {
  // First iteration to get list of IDs that are project component
  const projectCompIds: string[] = [];
  const projectIds: string[] = [];
  for (const component of components) {
    if (component.type !== 'project') {
      continue;
    }
    projectCompIds.push(component.id);
    projectIds.push(component.typeId!);
  }

  // Second iteration to get list of edges pointing from or to the list of IDs
  const edges = [];
  for (const component of components) {
    if (component.type !== 'project') {
      // Find link to project
      const has = component.edges.find((edge) =>
        projectCompIds.includes(edge.target)
      );
      if (has) {
        edges.push(has);
      }
      continue;
    }

    // Find from project
    edges.push(...component.edges);
  }

  // Compute the end results for each project
  // This will tell us if we read or write, and merge if there are multiple instance of the same project component
  const relations: Record<string, ProjectRelation> = {};
  for (const component of components) {
    if (component.type !== 'project') {
      continue;
    }

    // Compute edge from the outside project to the current
    const from = { read: false, write: false };
    for (const edge of component.edges) {
      if (edge.read) from.read = true;
      if (edge.write) from.write = true;
    }

    // Compute from current project to outside project
    const to = { read: false, write: false };
    for (const other of components) {
      if (other.type === 'project') {
        continue;
      }

      // Find link to project
      const has = other.edges.find((edge) => edge.target === component.id);
      if (!has) {
        continue;
      }

      if (has.read) to.read = true;
      if (has.write) to.write = true;
    }

    if (!relations[component.typeId!]) {
      relations[component.typeId!] = { from, to };
    } else {
      const update = relations[component.typeId!];
      // We can have the same project linked multiple times so we need to merge

      relations[component.typeId!] = {
        from: {
          read: update.from.read || from.read,
          write: update.from.write || from.write,
        },
        to: {
          read: update.to.read || to.read,
          write: update.to.write || to.write,
        },
      };
    }
  }

  return relations;
}
