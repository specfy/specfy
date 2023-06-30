import type { Edge, Node } from 'reactflow';

import type {
  ComponentForFlow,
  ComputedFlow,
  EdgeData,
  NodeData,
} from './types.js';

export function createNode(component: ComponentForFlow): Node<NodeData> {
  const node: Node<NodeData> = {
    id: component.id,
    type: 'custom',
    data: {
      label: component.name,
      type: component.type,
      techId: component.techId,
      originalSize: component.display.size,
    },
    position: { ...component.display.pos },
    targetPosition: 'left' as any,
    sourcePosition: 'right' as any,
    style: {
      width: `${component.display.size.width}px`,
      height: `${component.display.size.height}px`,
    },
    deletable: true,
    connectable: true,
    draggable: true,
    focusable: true,
    selectable: true,
  };

  if (component.inComponent) {
    node.extent = 'parent';
    node.parentNode = component.inComponent;
  }

  return node;
}

export function getEdgeMarkers(data: EdgeData) {
  const edge: Partial<Edge> = {};
  if (data.read) {
    edge.markerStart = {
      type: 'arrowclosed' as any,
      width: 10,
      height: 10,
    };
  }
  if (data.write) {
    edge.markerEnd = {
      type: 'arrowclosed' as any,
      width: 10,
      height: 10,
    };
  }
  return edge;
}
export function componentsToFlow(components: ComponentForFlow[]): ComputedFlow {
  const edges: Array<Edge<EdgeData>> = [];
  const nodes: Array<Node<NodeData>> = [];

  // Create all hosting nodes
  // We need to add them first because React Flow is not reordering
  const hosts = components.filter((comp) => comp.type === 'hosting');
  const done: string[] = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (hosts.length <= 0) {
      break;
    }
    const host = hosts.shift()!;
    if (host.inComponent && !done.includes(host.inComponent)) {
      hosts.push(host);
      continue;
    }

    nodes.push(createNode(host));
    done.push(host.id);
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
      const item: Edge<EdgeData> = {
        id: `${comp.id}->${edge.to}`,
        source: comp.id,
        target: edge.to,
        sourceHandle: edge.portSource,
        targetHandle: edge.portTarget,
        data: { read: edge.read, write: edge.write },
        ...getEdgeMarkers(edge),
        // type: 'floating',
      };
      edges.push(item);
    }
  }

  return { edges, nodes };
}
