import type { ApiOrg } from '@specfy/models';
import { produce } from 'immer';
import { create } from 'zustand';

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
