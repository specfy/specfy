import classNames from 'classnames';
import type { Connection, Edge, EdgeChange, Node, NodeChange } from 'reactflow';

import type { ComponentsState } from '../../common/store';
import type { TechSearchItem } from '../StackSearch/TechSearch';

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

export const onNodesChangeProject: (
  store: ComponentsState
) => OnNodesChangeSuper = (store) => {
  return (changes) => {
    for (const change of changes) {
      if (change.type === 'remove') {
        store.remove(change.id);
      } else if (change.type === 'position') {
        if (change.position) {
          const comp = store.select(change.id)!;
          store.updateField(change.id, 'display', {
            ...comp.display,
            pos: change.position,
          });
        }
      } else if (change.type === 'group') {
        const comp = store.select(change.id)!;
        store.update({
          ...comp,
          inComponent: { id: change.parentId },
          display: {
            ...comp.display,
            pos: change.position,
          },
        });
      } else if (change.type === 'ungroup') {
        store.updateField(change.id, 'inComponent', { id: null });
      } else if (change.type === 'rename') {
        store.updateField(change.id, 'name', change.name);
      } else if (change.type === 'tech') {
        const comp = store.select(change.id)!;
        if (!change.tech) {
          store.update({
            ...comp,
            typeId: null,
            techId: null,
            type: 'service',
          });
        } else if (change.tech.type === 'project') {
          store.update({
            ...comp,
            typeId: change.tech.key,
            type: 'project',
            techId: null,
            name: change.tech.name,
          });
        } else {
          store.update({
            ...comp,
            techId: change.tech.key,
            type: change.tech.type,
            name:
              comp.name === 'untitled' || !comp.name
                ? change.tech.name
                : comp.name,
          });
        }
      } else if (change.type === 'dimensions' && change.dimensions) {
        const comp = store.select(change.id)!;
        store.update({
          ...comp,
          display: {
            ...comp.display,
            size: change.dimensions,
          },
        });
      }
    }
  };
};
