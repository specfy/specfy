import { produce } from 'immer';
import { create } from 'zustand';

import type { ApiProject, ApiProjectList } from '@specfy/models';

import { original } from './original';

export interface ProjectState {
  projects: ApiProjectList[];
  project: ApiProject | null;
  fill: (value: ApiProjectList[]) => void;
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
    const item = original.find<ApiProject>(proj.id)!;
    set({ project: { ...proj, [field]: item[field] } });
  },
}));
