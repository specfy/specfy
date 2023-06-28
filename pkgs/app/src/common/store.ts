import { nanoid } from '@specfy/api/src/common/id';
import type {
  ApiBlobWithPrevious,
  ApiComponent,
  ApiDocument,
  ApiOrg,
  ApiProject,
  ApiRevision,
} from '@specfy/api/src/types/api';
import { produce } from 'immer';
import { create } from 'zustand';

import type { Allowed, BlobAndDiffs } from '../types/blobs';

import { getEmptyDoc } from './content';
import { slugify } from './string';

const originalStore: Allowed[] = [];

function add(value: Allowed) {
  if (find(value.id)) {
    return;
  }

  originalStore.push(JSON.parse(JSON.stringify(value)));
}

function find<T extends Allowed>(id: string): T | undefined {
  return originalStore.find<T>((val): val is T => {
    return val.id === id;
  });
}

function allowedType(item: Allowed): ApiBlobWithPrevious['type'] {
  if ('links' in item) {
    return 'project';
  } else if ('content' in item) {
    return 'document';
  }
  return 'component';
}

function revertAll(diffs: BlobAndDiffs[]) {
  /* eslint-disable @typescript-eslint/no-use-before-define */
  const project = useProjectStore.getState();
  const components = useComponentsStore.getState();
  const documents = useDocumentsStore.getState();
  /* eslint-enable @typescript-eslint/no-use-before-define */

  for (const diff of diffs) {
    if (diff.blob.type === 'project') {
      project.update(find<ApiProject>(diff.blob.typeId)!);
    } else if (diff.blob.type === 'component') {
      components.revert(diff.blob.typeId);
    } else if (diff.blob.type === 'document') {
      documents.revert(diff.blob.typeId);
    }
  }
}

export default { add, find, allowedType, revertAll, originalStore };

// ------------------------------------------ Orgs Store
export interface OrgState {
  current: ApiOrg | null;
  orgs: ApiOrg[];
  fill: (value: ApiOrg[]) => void;
  setCurrent: (value: ApiOrg) => void;
}

export const useOrgStore = create<OrgState>()((set) => ({
  current: null,
  orgs: [],
  fill: (values) => {
    set({ orgs: values });
  },
  setCurrent: (curr) => {
    set(
      produce((state) => {
        state.current = curr;
      })
    );
  },
}));

// ------------------------------------------ Staging Store
interface StagingState {
  count: number;
  diffs: BlobAndDiffs[];
  update: (diffs: BlobAndDiffs[], count: number) => void;
}

export const useStagingStore = create<StagingState>()((set) => ({
  count: 0,
  diffs: [],
  update: (diffs, count) => {
    set({ diffs, count });
  },
}));

// ------------------------------------------ Project Store
export interface ProjectState {
  projects: ApiProject[];
  project: ApiProject | null;
  fill: (value: ApiProject[]) => void;
  update: (value: ApiProject) => void;
  updateField: <TKey extends keyof ApiProject>(
    field: TKey,
    value: ApiProject[TKey]
  ) => void;
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
  updateField: (field, value) => {
    set(
      produce((state: ProjectState) => {
        state.project![field] = value;
      })
    );
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
  revert: (id: string) => void;
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
    const item = originalStore.find((i): i is ApiComponent => id === i.id);
    set(
      produce((state: ComponentsState) => {
        if (!item) delete state.components[id];
        else state.components[id] = item;
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
  deleted: string[];
  add: (values: ApiDocument[]) => void;
  create: (
    data: Pick<ApiDocument, 'name' | 'orgId' | 'projectId' | 'type'>
  ) => ApiDocument;
  update: (value: ApiDocument) => void;
  updateField: <TKey extends keyof ApiDocument>(
    id: string,
    field: TKey,
    value: ApiDocument[TKey]
  ) => void;
  revert: (id: string) => void;
  revertField: (id: string, field: keyof ApiDocument) => void;
  remove: (id: string) => void;
}
export const useDocumentsStore = create<DocumentsState>()((set, get) => ({
  documents: {},
  deleted: [],
  add: (values) => {
    set(
      produce((state: DocumentsState) => {
        for (const value of values) {
          state.documents[value.id] = state.documents[value.id] || value;
        }
      })
    );
  },
  create: (data) => {
    const doc: ApiDocument = {
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
      parentId: null,
      source: null,
      sourcePath: null,
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
  revert: (id) => {
    const item = originalStore.find((i): i is ApiDocument => id === i.id);
    set(
      produce((state: DocumentsState) => {
        if (!item) delete state.documents[id];
        else state.documents[id] = item;
      })
    );
  },
  revertField: (id, field) => {
    const comp = get().documents[id];
    const item = originalStore.find((i): i is ApiDocument => comp.id === i.id)!;
    get().updateField(id, field, item[field]);
  },
  remove: (id) => {
    set(
      produce((state: DocumentsState) => {
        delete state.documents[id];
        state.deleted.push(id);
      })
    );
  },
}));

// ------------------------------------------ Revision Store
interface RevisionState {
  current: ApiRevision | null;
  blobs: ApiBlobWithPrevious[];
  setCurrent: (current: ApiRevision | null) => void;
  setBlobs: (blobs: ApiBlobWithPrevious[]) => void;
}

export const useRevisionStore = create<RevisionState>()((set) => ({
  current: null,
  blobs: [],
  setCurrent: (current) => {
    set({ current });
  },
  setBlobs: (blobs) => {
    set({ blobs });
  },
}));
