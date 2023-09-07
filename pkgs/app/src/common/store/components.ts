import type { ApiComponent, FlowEdge } from '@specfy/models';
import { getAbsolutePosition } from '@specfy/models/src/flows/transform';
import { produce } from 'immer';
import type { Connection } from 'reactflow';
import { create } from 'zustand';

import { original } from './original';

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

        const visible = !src.show;
        src.show = visible;

        // Hide all outgoing edges
        for (const edge of src.edges) {
          edge.show = visible;
        }

        for (const copy of components) {
          if (copy.id === id) {
            continue;
          }

          // Hide any incoming edges
          const edges: ApiComponent['edges'] = [];
          for (const edge of copy.edges) {
            if (edge.target === id) {
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
              copy.edges[index] = { ...edge, ...update };
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
}));
