import type { ComputedFlow } from '@specfy/models';
import { produce } from 'immer';
import { create } from 'zustand';

import type {
  OnEdgesChangeSuper,
  OnNodesChangeSuper,
} from '@/components/Flow/types';

interface FlowState {
  flow: ComputedFlow | null;
  setCurrent: (flow: ComputedFlow) => void;
  updateNode: OnNodesChangeSuper;
  updateEdge: OnEdgesChangeSuper;
}

/**
 * This is the store for "uncontrolled" Flow. (e.g: Org flow)
 * The components flow are controlled by the Components Store because it needs top -> bottom sync.
 */
export const useFlowStore = create<FlowState>()((set) => ({
  flow: null,
  setCurrent: (flow) => {
    set({ flow });
  },
  updateNode: (changes) => {
    set(
      produce((state: FlowState) => {
        for (const change of changes) {
          if (change.type === 'position') {
            if (!change.position) {
              continue;
            }
            const node = state.flow!.nodes.find((n) => n.id === change.id)!;
            node.position = { ...change.position };
          }
        }
      })
    );
  },
  updateEdge: (changes) => {
    set(
      produce((state: FlowState) => {
        for (const change of changes) {
          if (change.type !== 'changeTarget') {
            return;
          }

          const edge = state.flow!.edges.find((e) => e.id === change.id)!;
          edge.targetHandle = change.newTargetHandle;
          edge.sourceHandle = change.newSourceHandle;
        }
      })
    );
  },
}));
