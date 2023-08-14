import type { ApiBlobWithPrevious, ApiRevision } from '@specfy/models';
import { create } from 'zustand';

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
