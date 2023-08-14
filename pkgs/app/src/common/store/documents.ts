import type { ApiDocument } from '@specfy/api/src/types/api';
import { nanoid } from '@specfy/core/src/id';
import { produce } from 'immer';
import { create } from 'zustand';

import { getEmptyDoc } from '../content';
import { slugify } from '../string';

import { findOriginal } from './original';

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
    const item = findOriginal<ApiDocument>(id);
    set(
      produce((state: DocumentsState) => {
        if (!item) delete state.documents[id];
        else state.documents[id] = item;
      })
    );
  },
  revertField: (id, field) => {
    const doc = get().documents[id];
    const item = findOriginal<ApiDocument>(doc.id)!;
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
