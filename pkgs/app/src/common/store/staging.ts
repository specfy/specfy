import { create } from 'zustand';

import type { BlobAndDiffs } from '@/types/blobs';

interface StagingState {
  count: number;
  diffs: BlobAndDiffs[];
  hasGraphChanged: boolean;
  update: (
    diffs: BlobAndDiffs[],
    count: number,
    hasGraphChanged: boolean
  ) => void;
}

export const useStagingStore = create<StagingState>()((set) => ({
  count: 0,
  diffs: [],
  hasGraphChanged: false,
  update: (diffs, count, hasGraphChanged) => {
    set({ diffs, count, hasGraphChanged });
  },
}));
