import type { ApiComponent, ApiProject, FlowEdge } from '@specfy/models';
import {
  getAbsolutePosition,
  placeInsideHost,
} from '@specfy/models/src/flows/transform';
import { produce } from 'immer';
import type { Connection } from 'reactflow';
import { create } from 'zustand';

import { getEmptyDoc } from '../content';
import { slugify } from '../string';

import type { FlowState } from './flow';
import { original } from './original';

import type {
  BatchNodeUpdate,
  EdgeChangeSuper,
  NodeChangeSuper,
  OnEdgesChangeSuper,
  OnNodesChangeSuper,
} from '@/components/Flow/types';

export interface ComponentsState {
  current: string | null;
  components: Record<string, ApiComponent>;
  fill: (value: ApiComponent[]) => void;
  create: (value: ApiComponent) => void;
  setCurrent: (id: string) => void;
  select: (id: string) => ApiComponent | undefined;
  update: (value: ApiComponent) => void;
  updateField: <TKey extends keyof ApiComponent>(
    id: string,
    field: TKey,
    value: ApiComponent[TKey]
  ) => void;
  revert: (id: string) => void;
  revertField: (id: string, field: keyof ApiComponent) => void;
  remove: (id: string) => void;
  setVisibility: (id: string) => void;
  addEdge: (edge: Connection) => void;
  updateEdge: (
    source: string,
    target: string,
    update: Partial<FlowEdge> | ((edge: FlowEdge) => FlowEdge)
  ) => void;
  removeEdge: (source: string, target: string) => void;
  batchLayout: (changes: BatchNodeUpdate[]) => void;
  syncFromFlow: (state: FlowState, proj: ApiProject) => void;
}

export const useComponentsStore = create<ComponentsState>()((set, get) => ({
  current: null,
  components: {},
  fill: (values) => {
    const map: ComponentsState['components'] = {};
    for (const value of values) {
      map[value.id] = value;
    }
    set({ components: map });
  },
  create: (value) => {
    set(
      produce((state: ComponentsState) => {
        state.components[value.id] = value;
      })
    );
  },
  setCurrent: (curr) => {
    set(
      produce((state) => {
        state.current = curr;
      })
    );
  },
  select: (id) => {
    for (const comp of Object.values(get().components)) {
      if (comp.id === id) {
        return comp;
      }
    }
    return undefined;
  },
  update: (value) => {
    set(
      produce((state: ComponentsState) => {
        state.components[value.id] = value;
      })
    );
  },
  updateField: (id, field, value) => {
    set(
      produce((state: ComponentsState) => {
        state.components[id][field] = value;
      })
    );
  },
  revert: (id) => {
    const item = original.find<ApiComponent>(id);
    set(
      produce((state: ComponentsState) => {
        if (!item) delete state.components[id];
        else state.components[id] = item;
      })
    );
  },
  revertField: (id, field) => {
    const comp = get().components[id];
    const item = original.find<ApiComponent>(comp.id)!;
    get().updateField(id, field, item[field]);
  },
  setVisibility: (id) => {
    set(
      produce((state: ComponentsState) => {
        const components = Object.values(state.components);

        const src = components.find((c) => c.id === id);
        if (!src) {
          return;
        }

        const visible = src.show === false;
        src.show = visible;

        // Hide all outgoing edges
        for (const edge of src.edges) {
          // Do not modify edge if target is hidden
          if (components.find((c) => c.id === edge.target)?.show) {
            edge.show = visible;
          }
        }

        // Hide all children
        const children = listAllChildren(components, src.id);

        for (const copy of components) {
          if (copy.id === id) {
            continue;
          }

          if (children.includes(copy.id)) {
            copy.show = visible;
          }

          // Hide any incoming edges
          const edges: ApiComponent['edges'] = [];
          for (const edge of copy.edges) {
            if (
              edge.target === id ||
              children.includes(copy.id) ||
              children.includes(edge.target)
            ) {
              edge.show = visible;
            }

            edges.push(edge);
          }
          copy.edges = edges;
        }
      })
    );
  },
  remove: (id) => {
    set(
      produce((state: ComponentsState) => {
        const unmodified = Object.values(state.components);
        const components = Object.values(state.components);

        const src = components.find((c) => c.id === id);
        if (!src) {
          return;
        }

        if (src.source) {
          throw new Error('cant delete a managed component');
        }

        for (const copy of components) {
          if (copy.id === id) {
            continue;
          }

          // Ungroup components that might be inside this host
          if (copy.inComponent.id === id) {
            copy.display.pos = getAbsolutePosition(copy, unmodified);
            copy.inComponent = { id: null };
          }

          // Remove any edges pointing toward this component
          const edges: ApiComponent['edges'] = [];
          for (const edge of copy.edges) {
            if (edge.target === id) {
              continue;
            }

            edges.push(edge);
          }

          copy.edges = edges;
        }

        delete state.components[id];
      })
    );
  },
  addEdge: (connection) => {
    set(
      produce((state: ComponentsState) => {
        const components = Object.values(state.components);

        for (const copy of components) {
          if (copy.id !== connection.source) {
            continue;
          }

          // already exist
          const exists = copy.edges.findIndex(
            (edge) => edge.target === connection.target
          );
          if (exists > -1) {
            copy.edges[exists].portTarget = connection.targetHandle as any;
            continue;
          }

          copy.edges.push({
            target: connection.target!,
            portSource: connection.sourceHandle as any,
            portTarget: connection.targetHandle as any,
            read: true,
            write: true,
            vertices: [],
          });
        }
      })
    );
  },
  updateEdge: (source, target, update) => {
    set(
      produce((state: ComponentsState) => {
        const components = Object.values(state.components);

        for (const copy of components) {
          if (copy.id !== source) {
            continue;
          }

          for (let index = 0; index < copy.edges.length; index++) {
            const edge = copy.edges[index];
            if (edge.target !== target) {
              continue;
            }

            if (typeof update === 'function') {
              copy.edges[index] = update(edge);
            } else {
              copy.edges[index] = {
                ...edge,
                ...update,
                show: update.show || edge.show,
              };
            }
          }
        }
      })
    );
  },
  removeEdge: (source, target) => {
    set(
      produce((state: ComponentsState) => {
        const components = Object.values(state.components);

        for (const copy of components) {
          if (copy.id !== source) {
            continue;
          }

          const map: FlowEdge[] = [];
          for (const edge of copy.edges) {
            if (edge.target !== target) {
              map.push(edge);
              continue;
            }
            if (edge.source) {
              edge.show = false;
              map.push(edge);
              continue;
            }
          }
          copy.edges = map;
        }
      })
    );
  },
  batchLayout: (changes) => {
    set(
      produce((state: ComponentsState) => {
        const components = Object.values(state.components);
        for (const change of changes) {
          const node = components.find((n) => n.id === change.id);
          if (!node) {
            continue;
          }

          node.display = {
            ...node.display,
            size: change.size,
            pos: change.position || node.display.pos,
          };
        }
      })
    );
  },

  syncFromFlow: (flow: FlowState, proj: ApiProject) => {
    set(
      produce((state: ComponentsState) => {
        const updates: ApiComponent[] = [];
        // console.log('received');
        for (const node of flow.nodes) {
          const origin = state.components[node.id];
          if (!origin) {
            // new components
            updates.push({
              id: node.id,
              orgId: proj.orgId,
              projectId: proj.id,
              techId: node.data.techId || null,
              type: node.data.type,
              typeId: node.data.typeId || null,
              name: node.data.name,
              slug: slugify(node.data.name),
              description: getEmptyDoc(),
              techs: [],
              display: {
                zIndex: node.zIndex || 1,
                pos: node.position,
                size: node.style as any,
              },
              edges: flowEdgesToComponentEdges(flow, node.id), // Todo edges
              blobId: null,
              inComponent: { id: node.parentNode || null },
              show: node.hidden ? false : true,
              tags: [],
              source: null,
              sourceName: null,
              sourcePath: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            continue;
          }

          const next = origin;
          next.techId = node.data.techId || null;
          next.type = node.data.type;
          next.typeId = node.data.typeId;
          next.name = node.data.name;
          next.display = {
            zIndex: node.zIndex || origin.display.zIndex || 1,
            pos: node.position,
            size: node.style as any,
          };
          origin.edges = flowEdgesToComponentEdges(flow, next.id, next); // Todo edges
          next.inComponent = { id: node.parentNode || null };
          next.show = node.hidden ? false : true;
          updates.push(next);
        }

        state.components = updates.reduce((prev, curr) => {
          prev[curr.id] = curr;
          return prev;
        }, {} as any);
      })
    );
  },
}));

/**
 * Central function to handle all node changes (in a project).
 */
export const onNodesChangeProject: (
  store: ComponentsState
) => OnNodesChangeSuper = (store) => {
  return (changes) => {
    for (const change of changes) {
      handleNodeChange(store, change);
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
      handleEdgeChange(store, change);
    }
  };
};

export function handleNodeChange(
  store: ComponentsState,
  change: NodeChangeSuper
) {
  switch (change.type) {
    case 'remove': {
      const comp = store.select(change.id)!;
      if (comp.source) {
        store.setVisibility(change.id);
      } else {
        store.remove(change.id);
      }
      break;
    }

    case 'position': {
      if (change.position) {
        const comp = store.select(change.id)!;
        store.updateField(change.id, 'display', {
          ...comp.display,
          pos: { ...change.position },
        });
      }
      break;
    }

    case 'group': {
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
      break;
    }

    case 'ungroup': {
      const comp = store.select(change.id)!;
      store.update({
        ...comp,
        inComponent: { id: null },
        display: {
          ...comp.display,
          pos: getAbsolutePosition(comp, Object.values(store.components)),
        },
      });
      break;
    }

    case 'rename': {
      store.updateField(change.id, 'name', change.name);
      break;
    }

    case 'tech': {
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
      break;
    }

    case 'dimensions': {
      if (!change.dimensions) {
        break;
      }
      const comp = store.select(change.id)!;
      store.update({
        ...comp,
        display: {
          ...comp.display,
          size: { ...change.dimensions },
        },
      });
      break;
    }
    case 'batch': {
      store.batchLayout(change.changes);
      break;
    }

    case 'visibility': {
      store.setVisibility(change.id);
      break;
    }
  }
}

export function handleEdgeChange(
  store: ComponentsState,
  change: EdgeChangeSuper
) {
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
        show: change.show,
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
        return st;
      });
      break;
    }
  }
}

function listAllChildren(components: ApiComponent[], parent: string): string[] {
  const list: string[] = [];
  for (const comp of components) {
    if (comp.inComponent.id === parent) {
      list.push(comp.id);
      if (comp.type === 'hosting') {
        list.push(...listAllChildren(components, comp.id));
      }
    }
  }
  return list;
}

function flowEdgesToComponentEdges(
  flow: FlowState,
  source: string,
  origin?: ApiComponent
): ApiComponent['edges'] {
  const copy: ApiComponent['edges'] = [];
  for (const edge of flow.edges) {
    if (edge.source !== source) {
      continue;
    }

    const prev = origin?.edges.find((e) => e.target === edge.target);

    const tmp: FlowEdge = {
      target: edge.target,
      vertices: prev ? prev.vertices : [],
      read: prev ? prev.read : edge.data!.read,
      write: prev ? prev.write : edge.data!.write,
      portSource: edge.sourceHandle as any,
      portTarget: edge.targetHandle as any,
    };

    // To avoid unnecessary diff on old values
    if (edge.hidden) {
      tmp.show = false;
    }
    if (prev && typeof tmp.source !== 'undefined') {
      tmp.source = prev.source;
    }
    copy.push(tmp);
  }

  return copy;
}
