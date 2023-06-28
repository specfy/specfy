import { MarkerType, Position } from 'reactflow';
import type { Edge, Node } from 'reactflow';

import type { ApiComponent } from '../../types/api/index.js';

export type ComponentForFlow = Pick<
  ApiComponent,
  'display' | 'edges' | 'id' | 'inComponent' | 'name' | 'techId' | 'type'
>;

export interface NodeData {
  label: string;
  type: ApiComponent['type'];
  techId: ApiComponent['techId'];
  originalSize: ComponentForFlow['display']['size'];
}

export interface ComputedFlow {
  edges: Edge[];
  nodes: Array<Node<NodeData>>;
}

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
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    style: {
      width: `${component.display.size.width}px`,
      height: `${component.display.size.height}px`,
    },
  };

  if (component.inComponent) {
    node.extent = 'parent';
    node.parentNode = component.inComponent;
  }

  return node;
}

export function componentsToFlow(components: ComponentForFlow[]): ComputedFlow {
  const edges: Edge[] = [];
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
      const item: Edge = {
        id: `${comp.id}->${edge.to}`,
        source: comp.id,
        target: edge.to,
        sourceHandle: edge.portSource,
        targetHandle: edge.portTarget,
        data: { read: edge.read, write: edge.write },
        // animated: true,
        // type: 'floating',
      };
      if (edge.read) {
        item.markerStart = {
          type: MarkerType.ArrowClosed,
          width: 10,
          height: 10,
        };
      }
      if (edge.write) {
        item.markerEnd = {
          type: MarkerType.ArrowClosed,
          width: 10,
          height: 10,
        };
      }
      edges.push(item);
    }
  }

  return { edges, nodes };
}
