import {
  getAbsolutePosition,
  placeInsideHost,
} from '@specfy/models/src/flows/transform';
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

/**
 * Central function to handle all node changes (in a project).
 */
export const onNodesChangeProject: (
  store: ComponentsState
) => OnNodesChangeSuper = (store) => {
  return (changes) => {
    for (const change of changes) {
      if (change.type === 'remove') {
        const comp = store.select(change.id)!;
        if (comp.source) {
          store.setVisibility(change.id);
        } else {
          store.remove(change.id);
        }
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
            pos: placeInsideHost(
              comp,
              change.parentId,
              Object.values(store.components)
            ),
          },
        });
      } else if (change.type === 'ungroup') {
        const comp = store.select(change.id)!;
        store.update({
          ...comp,
          inComponent: { id: null },
          display: {
            ...comp.display,
            pos: getAbsolutePosition(comp, Object.values(store.components)),
          },
        });
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
            typeId: change.tech.project.id,
            type: 'project',
            techId: null,
            name: change.tech.project.name,
          });
        } else if (change.tech.type === 'tech') {
          store.update({
            ...comp,
            techId: change.tech.tech.key,
            type: change.tech.tech.type,
            name:
              comp.name === 'untitled' || !comp.name
                ? change.tech.tech.name
                : comp.name,
          });
        } else if (change.tech.type === 'create') {
          store.update({
            ...comp,
            techId: 'unknown',
            type: 'api',
            name: change.tech.label,
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
      } else if (change.type === 'visibility') {
        store.setVisibility(change.id);
      }
    }
  };
};

/**
 * Central function to handle all edge changes (in a project).
 */
export const onEdgesChangeProject: (
  store: ComponentsState
) => OnEdgesChangeSuper = (store) => {
  return (changes) => {
    for (const change of changes) {
      switch (change.type) {
        case 'remove': {
          const [source, target] = change.id.split('->');
          store.removeEdge(source, target);
          break;
        }

        case 'changeTarget': {
          store.updateEdge(change.source, change.oldTarget, {
            portSource: change.newSourceHandle as any,
            target: change.newTarget,
            portTarget: change.newTargetHandle as any,
          });
          break;
        }

        case 'create': {
          store.addEdge(change.conn);
          break;
        }

        case 'direction': {
          const [source, target] = change.id.split('->');
          store.updateEdge(source, target, {
            write: change.write,
            read: change.read,
          });
          break;
        }

        case 'visibility': {
          const [source, target] = change.id.split('->');
          store.updateEdge(source, target, (st) => {
            st.show =
              st.show === true || typeof st.show === 'undefined' ? false : true;
            console.log('changing visibility', source, target, st.show);
            return st;
          });
          break;
        }
      }
    }
  };
};
