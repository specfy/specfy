import type { ApiComponent, ApiDocument, ApiProject } from 'api/src/types/api';
import type {
  DBBlobComponent,
  DBBlobDocument,
  DBBlobProject,
} from 'api/src/types/db/blobs';
import type { Change } from 'diff';
import { produce } from 'immer';
import { create } from 'zustand';

export type Allowed = ApiComponent | ApiDocument | ApiProject;

export type TmpBlob = TmpBlobComponent | TmpBlobDocument | TmpBlobProject;
export type TmpBlobComponent = DBBlobComponent & {
  typeId: string;
  previous: ApiComponent;
};
export type TmpBlobDocument = DBBlobDocument & {
  typeId: string;
  previous: ApiDocument;
};
export type TmpBlobProject = DBBlobProject & {
  typeId: string;
  previous: ApiProject;
};

export interface ComputedForDiff {
  type: TmpBlob['type'];
  typeId: string;
  key: string;
  previous: any;
  diff: Change[];
}

const originalStore: Allowed[] = [];

function add(value: Allowed) {
  if (find(value.id)) {
    return;
  }

  originalStore.push(JSON.parse(JSON.stringify(value)));
}

function find<T extends Allowed>(id: any): T | undefined {
  return originalStore.find<T>((val): val is T => {
    return val.id === id;
  });
}

export default { add, find };

// ------------------------------------------ Staging Store
interface StagingState {
  diffs: ComputedForDiff[];
  clean: TmpBlob[];
  update: (diffs: ComputedForDiff[], clean: TmpBlob[]) => void;
}

export const useStagingStore = create<StagingState>()((set) => ({
  diffs: [],
  clean: [],
  update: (diffs, clean) => {
    set({ diffs, clean });
  },
}));

// ------------------------------------------ Project Store
interface ProjectState {
  project: ApiProject | null;
  update: (value: ApiProject) => void;
  revertField: (field: keyof ApiProject) => void;
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
  project: null,
  update: (value) => {
    set({ project: value });
  },
  revertField: (field) => {
    const proj = get().project!;
    const item = originalStore.find((i): i is ApiProject => proj.id === i.id)!;
    set({ project: { ...proj, [field]: item[field] } });
  },
}));

// ------------------------------------------ Component Store
interface ComponentsState {
  components: Record<string, ApiComponent>;
  fill: (value: ApiComponent[]) => void;
  create: (value: ApiComponent) => void;
  select: (slug: string) => ApiComponent | undefined;
  update: (value: ApiComponent) => void;
  updateField: <TKey extends keyof ApiComponent>(
    id: string,
    field: TKey,
    value: ApiComponent[TKey]
  ) => void;
  revertField: (id: string, field: keyof ApiComponent) => void;
}
export const useComponentsStore = create<ComponentsState>()((set, get) => ({
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
  select: (slug) => {
    for (const comp of Object.values(get().components)) {
      if (comp.slug === slug) {
        return comp;
      }
    }
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
  revertField: (id, field) => {
    const comp = get().components[id];
    const item = originalStore.find(
      (i): i is ApiComponent => comp.id === i.id
    )!;
    get().updateField(id, field, item[field]);
  },
}));

// ------------------------------------------ Document Store
interface DocumentsState {
  documents: Record<string, ApiDocument>;
  add: (values: ApiDocument[]) => void;
  select: (slug: string) => ApiDocument | undefined;
  update: (value: ApiDocument) => void;
  updateField: <TKey extends keyof ApiDocument>(
    id: string,
    field: TKey,
    value: ApiDocument[TKey]
  ) => void;
  revertField: (id: string, field: keyof ApiDocument) => void;
}
export const useDocumentsStore = create<DocumentsState>()((set, get) => ({
  documents: {},
  add: (values) => {
    set(
      produce((state: DocumentsState) => {
        for (const value of values) {
          state.documents[value.id] = state.documents[value.id] || value;
        }
      })
    );
  },
  select: (slug) => {
    for (const comp of Object.values(get().documents)) {
      if (comp.slug === slug) {
        return comp;
      }
    }
  },
  update: (value) => {
    set(
      produce((state: DocumentsState) => {
        state.documents[value.id] = value;
      })
    );
  },
  updateField: (id, field, value) => {
    set(
      produce((state: DocumentsState) => {
        state.documents[id][field] = value;
      })
    );
  },
  revertField: (id, field) => {
    const comp = get().documents[id];
    const item = originalStore.find((i): i is ApiDocument => comp.id === i.id)!;
    get().updateField(id, field, item[field]);
  },
}));