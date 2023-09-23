import type { Projects } from '@specfy/db';

import type { DBComponent } from '../components/types.js';

import type {
  FlowItemDisplay,
  ComponentForFlow,
  ComputedEdge,
  ComputedFlow,
  ComputedNode,
  EdgeData,
} from './types.js';

export function createNodeFromProject(
  project: Pick<Projects, 'id' | 'name'>,
  display: FlowItemDisplay
) {
  return createNode({
    id: project.id,
    name: project.name,
    type: 'project',
    display: display,
    inComponent: { id: null },
    techId: null,
    typeId: null,
    source: null,
    show: true,
  });
}

export function createNode(
  component: Omit<ComponentForFlow, 'edges'>
): ComputedNode {
  const node: ComputedNode = {
    id: component.id,
    type: 'custom',
    data: {
      name: component.name,
      type: component.type,
      techId: component.techId,
      typeId: component.typeId,
      originalSize: component.display.size,
      source: component.source,
    },
    position: component.display.pos,
    style: {
      width: component.display.size.width,
      height: component.display.size.height,
    },
    width: component.display.size.width,
    height: component.display.size.height,
    hidden: component.show === false,
  };

  if (component.inComponent.id) {
    // node.extent = 'parent';
    node.parentNode = component.inComponent.id;
    node.expandParent = true;
  }

  return node;
}

export function getEdgeMarkers(data: EdgeData) {
  const edge: Partial<ComputedEdge> = {};
  // if (data.read) {
  //   edge.markerStart = {
  //     type: 'arrowclosed' as any,
  //     width: 10,
  //     height: 10,
  //   };
  // }
  if (data.write) {
    edge.markerEnd = {
      type: 'arrowclosed' as any,
      width: 14,
      height: 14,
    };
  }
  return edge;
}

export function componentsToFlow(components: ComponentForFlow[]): ComputedFlow {
  const edges: ComputedEdge[] = [];
  const nodes: ComputedNode[] = [];

  // Create all hosting nodes
  // We need to add them first because React Flow is not reordering
  const hosts = components.filter((comp) => comp.type === 'hosting');
  const done: string[] = [];

  let i = 0;
  while (i < 999) {
    i += 1;
    if (hosts.length <= 0) {
      break;
    }
    const host = hosts.shift()!;
    if (host.inComponent.id && !done.includes(host.inComponent.id)) {
      hosts.push(host);
      continue;
    }

    nodes.push(createNode(host));
    done.push(host.id);
  }
  if (i >= 998) {
    throw new Error("Can't compute host");
  }

  // Create all other nodes
  for (const comp of components) {
    if (comp.type === 'hosting') {
      continue;
    }

    nodes.push(createNode(comp));
  }

  for (const comp of components) {
    for (const edge of comp.edges) {
      const item: ComputedEdge = {
        id: `${comp.id}->${edge.target}`,
        source: comp.id,
        target: edge.target,
        sourceHandle: edge.portSource,
        targetHandle: edge.portTarget,
        data: { read: edge.read, write: edge.write, source: edge.source },
        hidden: edge.show === false,
        ...getEdgeMarkers(edge),
        // type: 'floating',
      };
      edges.push(item);
    }
  }

  return { edges, nodes };
}

export function getAbsolutePosition(
  component: DBComponent,
  components: DBComponent[]
) {
  let x = 0;
  let y = 0;
  let host: DBComponent | undefined = component;

  do {
    if (host) {
      x += host.display.pos.x;
      y += host.display.pos.y;

      host = host.inComponent.id
        ? components.find((c) => c.id === host?.inComponent.id)
        : undefined;
    }
  } while (host);

  return { x, y };
}

export function placeInsideHost(
  component: DBComponent,
  idHost: string,
  components: DBComponent[]
) {
  const host = components.find((c) => c.id === idHost);
  if (!host) {
    return { x: 0, y: 0 };
  }

  const absComp = getAbsolutePosition(component, components);
  const absHost = getAbsolutePosition(host, components);

  const x = Math.abs(absHost.x - absComp.x);
  const y = Math.abs(absHost.y - absComp.y);

  return { x, y };
}
