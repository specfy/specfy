import classNames from 'classnames';
import type { Edge, Node, NodeChange } from 'reactflow';

import cls from './index.module.scss';

export type NodeChangeSuper =
  | NodeChange
  | {
      id: string;
      type: 'group';
      parentId: string;
      position: { x: number; y: number };
    }
  | {
      id: string;
      type: 'ungroup';
    };
export type OnNodesChangeSuper = (changes: NodeChangeSuper[]) => void;

export function highlightNode({
  id,
  nodes,
  edges,
}: {
  id: string;
  nodes: Node[];
  edges: Edge[];
}): { nodes: Node[]; edges: Edge[] } {
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
    if (isSource && edge.data.write) {
      anim = cls.animateWriteLine;
    } else if (isTarget && edge.data.write) {
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
      return {
        ...node,
        className: node.className ? node.className.replace(cls.show, '') : '',
      };
    }

    return {
      ...node,
      className: node.className?.includes(cls.show)
        ? node.className
        : classNames(node.className, cls.show),
    };
  });

  return { nodes: upNodes, edges: upEdges };
}
