import { nanoid } from 'api/src/common/id';
import type { ApiComponent, ApiDocument, ApiProject } from 'api/src/types/api';
import type {
  DBBlobComponent,
  DBBlobDocument,
  DBBlobProject,
} from 'api/src/types/db';
import type { Change } from 'diff';
import { produce } from 'immer';
import { create } from 'zustand';

import { getEmptyDoc } from '../components/Editor/helpers';

import { slugify } from './string';

export type Allowed = ApiComponent | ApiDocument | ApiProject;

export type TmpBlob = TmpBlobComponent | TmpBlobDocument | TmpBlobProject;
export type TmpBlobComponent = DBBlobComponent & {
  typeId: string;
  previous: ApiComponent | null;
};
export type TmpBlobDocument = DBBlobDocument & {
  typeId: string;
  previous: ApiDocument | null;
};
export type TmpBlobProject = DBBlobProject & {
  typeId: string;
  previous: ApiProject;
};

export interface ComputedForDiff {
  type: TmpBlob['type'];
  typeId: string;
  key: string;
  current: TmpBlob['blob'] | null;
  previous: ApiComponent | ApiDocument | ApiProject | null;
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

function allowedType(item: Allowed) {
  if ('links' in item) {
    return 'project';
  } else if ('content' in item) {
    return 'document';
  }
  return 'component';
}

export default { add, find, allowedType, originalStore };

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
export interface ProjectState {
  projects: ApiProject[];
  project: ApiProject | null;
  fill: (value: ApiProject[]) => void;
  update: (value: ApiProject) => void;
  revertField: (field: keyof ApiProject) => void;
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
  project: null,
  projects: [],
  fill: (values) => {
    set({ projects: values });
  },
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
  revertField: (id: string, field: keyof ApiComponent) => void;
  remove: (id: string) => void;
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
        if (edge.to === id) {
          continue;
        }

        edges.push(edge);
      }

      map[copy.id] = { ...copy, edges };
    }

    set({ components: map });
  },
}));

// ------------------------------------------ Document Store
export interface DocumentsState {
  documents: Record<string, ApiDocument>;
  add: (values: ApiDocument[]) => void;
  select: (
    type: ApiDocument['type'],
    typeId: number
  ) => ApiDocument | undefined;
  create: (
    data: Pick<ApiDocument, 'name' | 'orgId' | 'projectId' | 'type'>
  ) => ApiDocument;
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
  select: (type, typeId) => {
    for (const doc of Object.values(get().documents)) {
      if (doc.type === type && doc.typeId === typeId) {
        return doc;
      }
    }
  },
  create: (data) => {
    const doc = {
      id: nanoid(),
      orgId: data.orgId,
      projectId: data.projectId,
      type: data.type,
      typeId: 99,
      blobId: '',
      name: data.name,
      slug: slugify(data.name),
      content: getEmptyDoc(),
      authors: [],
      approvedBy: [],
      reviewers: [],
      tldr: '',
      locked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set(
      produce((state: DocumentsState) => {
        state.documents[doc.id] = doc;
      })
    );
    return doc;
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
