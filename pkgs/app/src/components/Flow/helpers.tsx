import type { ApiComponent } from 'api/src/types/api';
import classNames from 'classnames';
import { MarkerType, Position } from 'reactflow';
import type { Edge, Node } from 'reactflow';

import cls from './index.module.scss';

export type ComponentForFlow = Pick<
  ApiComponent,
  'display' | 'edges' | 'id' | 'inComponent' | 'name' | 'techId' | 'type'
>;

export interface NodeData {
  label: string;
  type: ApiComponent['type'];
  techId: ApiComponent['techId'];
}

export interface ComputedFlow {
  edges: Edge[];
  nodes: Array<Node<NodeData>>;
}

function createNode(component: ComponentForFlow): Node<NodeData> {
  const node: Node<NodeData> = {
    id: component.id,
    type: 'custom',
    data: {
      label: component.name,
      type: component.type,
      techId: component.techId,
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
        markerStart: edge.read
          ? {
              type: MarkerType.ArrowClosed,
              width: 10,
              height: 10,
            }
          : undefined,
        markerEnd: edge.write
          ? {
              type: MarkerType.ArrowClosed,
              width: 10,
              height: 10,
            }
          : undefined,
        // animated: true,
        // type: 'floating',
      };
      edges.push(item);
    }
  }

  return { edges, nodes };
}

export function highlightNode(
  id: string,
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[] } {
  const related = new Set<string>();

  // Update edges and find related nodes
  const upEdges = edges.map((edge) => {
    const isSource = edge.source === id;
    const isTarget = edge.target === id;
    if (isSource) {
      related.add(edge.target);
    } else if (isTarget) {
      related.add(edge.source);
    } else {
      return { ...edge, className: undefined };
    }

    let anim: string = cls.animateReadLine;
    if (isSource && edge.markerEnd) {
      anim = cls.animateWriteLine;
    } else if (isTarget && edge.markerEnd) {
      anim = cls.animateWriteLine;
    }

    return {
      ...edge,
      className: classNames(cls.show, anim),
    };
  });

  // Update nodes
  const upNodes = nodes.map((node) => {
    if (node.id !== id && !related.has(node.id) && node.parentNode !== id) {
      return { ...node, className: undefined };
    }

    return { ...node, className: cls.show };
  });

  return { nodes: upNodes, edges: upEdges };
}
