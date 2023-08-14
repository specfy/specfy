import type { ApiComponent } from '@specfy/models';
import { produce } from 'immer';
import type { Connection } from 'reactflow';
import { create } from 'zustand';

import { findOriginal } from './original';

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
  addEdge: (edge: Connection) => void;
  updateEdge: (
    source: string,
    target: string,
    update: Partial<ApiComponent['edges'][0]>
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
    const item = findOriginal<ApiComponent>(id);
    set(
      produce((state: ComponentsState) => {
        if (!item) delete state.components[id];
        else state.components[id] = item;
      })
    );
  },
  revertField: (id, field) => {
    const comp = get().components[id];
    const item = findOriginal<ApiComponent>(comp.id)!;
    get().updateField(id, field, item[field]);
  },
  remove: (id) => {
    const components = Object.values(get().components);
    const map: ComponentsState['components'] = {};

    for (const copy of components) {
      if (copy.id === id) {
        continue;
      }

      if (copy.inComponent === id) {
        copy.inComponent = null;
      }

      // Remove any edges pointing toward this component
      const edges: ApiComponent['edges'] = [];
      for (const edge of copy.edges) {
        if (edge.target === id) {
          continue;
        }

        edges.push(edge);
      }

      map[copy.id] = { ...copy, edges };
    }

    set({ components: map });
  },
  addEdge: (connection) => {
    const components = Object.values(get().components);
    const map: ComponentsState['components'] = {};

    for (const copy of components) {
      if (copy.id !== connection.source) {
        map[copy.id] = copy;
        continue;
      }

      // already exist
      const exists = copy.edges.findIndex(
        (edge) => edge.target === connection.target
      );
      if (exists > -1) {
        map[copy.id] = {
          ...copy,
          edges: [...copy.edges],
        };
        map[copy.id].edges[exists].portTarget = connection.targetHandle as any;
        continue;
      }

      map[copy.id] = {
        ...copy,
        edges: [
          ...copy.edges,
          {
            target: connection.target!,
            portSource: connection.sourceHandle as any,
            portTarget: connection.targetHandle as any,
            read: true,
            write: true,
            vertices: [],
          },
        ],
      };
    }
    set({ components: map });
  },
  updateEdge: (source, target, update) => {
    const components = Object.values(get().components);
    const map: ComponentsState['components'] = {};

    for (const copy of components) {
      if (copy.id !== source) {
        map[copy.id] = { ...copy };
        continue;
      }

      const edges: ApiComponent['edges'] = [];
      for (const edge of copy.edges) {
        if (edge.target !== target) {
          edges.push(edge);
          continue;
        }

        edges.push({
          ...edge,
          ...update,
        });
      }
      map[copy.id] = { ...copy, edges };
    }

    set({ components: map });
  },
  removeEdge: (source, target) => {
    const components = Object.values(get().components);
    const map: ComponentsState['components'] = {};

    for (const copy of components) {
      if (copy.id !== source) {
        map[copy.id] = { ...copy };
        continue;
      }

      const edges: ApiComponent['edges'] = [];
      for (const edge of copy.edges) {
        if (edge.target === target) {
          continue;
        }

        edges.push(edge);
      }
      map[copy.id] = { ...copy, edges };
    }

    set({ components: map });
  },
}));
