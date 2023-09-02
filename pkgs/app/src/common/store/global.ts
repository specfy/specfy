import { create } from 'zustand';

export interface GlobalState {
  sidebarCollapsed: boolean;
  update: <TKey extends keyof GlobalState>(
    key: TKey,
    value: GlobalState[TKey]
  ) => void;
}

export const useGlobal = create<GlobalState>()((set) => ({
  sidebarCollapsed: false,
  update: (key, value) => {
    set((state) => {
      return { ...state, [key]: value };
    });
  },
}));
