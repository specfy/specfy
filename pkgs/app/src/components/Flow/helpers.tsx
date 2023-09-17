import classNames from 'classnames';
import type { Connection, Edge, EdgeChange, Node, NodeChange } from 'reactflow';

import type { TechSearchItem } from '../StackSearch/TechSearch';

import cls from './index.module.scss';

export type NodeChangeSuper =
  | NodeChange
  | {
      id: string;
      type: 'group';
      parentId: string;
    }
  | {
      id: string;
      type: 'rename';
      name: string;
    }
  | {
      id: string;
      type: 'tech';
      tech: TechSearchItem | null;
    }
  | {
      id: string;
      type: 'ungroup';
    }
  | {
      id: string;
      type: 'visibility';
    };

export type OnNodesChangeSuper = (changes: NodeChangeSuper[]) => void;

export type EdgeChangeSuper =
  | EdgeChange
  | {
      id: string;
      type: 'changeTarget';
      source: string;
      newSourceHandle: string;
      oldTarget: string;
      newTarget: string;
      newTargetHandle: string;
    }
  | {
      type: 'create';
      conn: Connection;
    }
  | {
      type: 'direction';
      id: string;
      read: boolean;
      write: boolean;
    }
  | {
      type: 'visibility';
      id: string;
    };
export type OnEdgesChangeSuper = (changes: EdgeChangeSuper[]) => void;

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
