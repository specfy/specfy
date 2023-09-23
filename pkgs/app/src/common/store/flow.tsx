import type {
  ComputedEdge,
  ComputedFlow,
  ComputedNode,
  FlowEdge,
} from '@specfy/models';
import {
  mapSourceHandle,
  mapSourceHandleReverse,
  mapTargetHandle,
  mapTargetHandleReverse,
} from '@specfy/models/src/flows/constants';
import { getBestHandlePosition } from '@specfy/models/src/flows/helpers.edges';
import classNames from 'classnames';
import { produce } from 'immer';
import type {
  NodeMouseHandler,
  OnSelectionChangeFunc,
  useStoreApi,
} from 'reactflow';
import { create } from 'zustand';

// eslint-disable-next-line import/extensions
import cls from '@/components/Flow/index.module.scss';
import type {
  OnEdgesChangeSuper,
  OnNodesChangeSuper,
} from '@/components/Flow/types';

export interface FlowState {
  nodes: ComputedNode[];
  edges: ComputedEdge[];
  deletable: boolean;
  connectable: boolean;
  nodeSelected: string | null;
  setReadonly: (read: boolean) => void;
  setCurrent: (flow: ComputedFlow) => void;
  onNodesChange: (store: ReturnType<typeof useStoreApi>) => OnNodesChangeSuper;
  onEdgesChange: OnEdgesChangeSuper;
  onSelectionChange: OnSelectionChangeFunc;
  onNodeMouseEnter: NodeMouseHandler;
  onNodeMouseLeave: NodeMouseHandler;
}

/**
 * This is the store for "uncontrolled" Flow. (e.g: Org flow)
 * The components flow are controlled by the Components Store because it needs top -> bottom sync.
 */
export const useFlowStore = create<FlowState>()((set) => ({
  nodes: [],
  edges: [],
  deletable: false,
  connectable: false,
  nodeSelected: null,
  setCurrent: (flow) => {
    set({ nodes: flow.nodes, edges: flow.edges });
  },
  setReadonly: (read) => {
    set(
      produce((state: FlowState) => {
        const isDeletable = !read && state.deletable;
        const isConnectable = !read && state.connectable;

        for (const node of state.nodes) {
          node.deletable = isDeletable;
          node.draggable = !read;
          node.connectable = isConnectable;
          node.focusable = true;
          node.selectable = true;
        }
      })
    );
  },
  onNodesChange: (store) => {
    // We need to access the internals to check absolute position
    // But it's only available through the React provider
    return (changes) => {
      set(
        produce((state: FlowState) => {
          const nodes = state.nodes;
          const edges = state.edges;

          for (const change of changes) {
            switch (change.type) {
              case 'add': {
                nodes.push(change.item);
                break;
              }

              case 'dimensions': {
                const item = nodes.find((n) => n.id === change.id)!;
                if (typeof change.dimensions !== 'undefined') {
                  item.width = change.dimensions.width;
                  item.height = change.dimensions.height;
                }
                if (typeof change.resizing === 'boolean') {
                  item.resizing = change.resizing;
                }
                if (typeof change.updateStyle !== 'undefined') {
                  item.style = { ...(item.style || {}), ...change.dimensions };
                }

                break;
              }

              case 'position': {
                const item = nodes.find((n) => n.id === change.id)!;
                if (typeof change.position !== 'undefined') {
                  item.position = change.position;
                }

                if (typeof change.positionAbsolute !== 'undefined') {
                  item.positionAbsolute = change.positionAbsolute;
                }

                if (typeof change.dragging !== 'undefined') {
                  item.dragging = change.dragging;
                }

                recomputeHandles(
                  item,
                  Array.from(store.getState().nodeInternals.values()),
                  edges
                );

                break;
              }

              case 'reset': {
                break;
              }

              case 'select': {
                const item = nodes.find((n) => n.id === change.id)!;
                item.selected = change.selected;
                break;
              }

              case 'remove': {
                const index = nodes.findIndex((n) => n.id === change.id);
                delete nodes[index];
                break;
              }
            }
          }
        })
      );
    };
  },
  onEdgesChange: (changes) => {
    set(
      produce((state: FlowState) => {
        for (const change of changes) {
          if (change.type !== 'changeTarget') {
            return;
          }

          const edge = state.edges.find((e) => e.id === change.id)!;
          edge.targetHandle = change.newTargetHandle;
          edge.sourceHandle = change.newSourceHandle;
        }
      })
    );
  },
  onSelectionChange: (opts) => {
    set(
      produce((state: FlowState) => {
        if (opts.nodes.length !== 1) {
          state.nodeSelected = null;
          highlightNode('nope', state.nodes, state.edges);
          return;
        }
        if (state.nodeSelected === opts.nodes[0].id) {
          return;
        }

        state.nodeSelected = opts.nodes[0].id;
        highlightNode(opts.nodes[0].id, state.nodes, state.edges);
      })
    );
  },
  onNodeMouseEnter: (_evt, node) => {
    set(
      produce((state: FlowState) => {
        highlightNode(node.id, state.nodes, state.edges);
      })
    );
  },
  onNodeMouseLeave: () => {
    set(
      produce((state: FlowState) => {
        highlightNode(state.nodeSelected || 'nope', state.nodes, state.edges);
      })
    );
  },
}));

function highlightNode(
  id: string,
  nodes: ComputedNode[],
  edges: ComputedEdge[]
) {
  const related = new Set<string>();

  // Update edges and find related nodes
  for (const edge of edges) {
    const isSource = edge.source === id;
    const isTarget = edge.target === id;
    if (isSource) {
      related.add(edge.target);
    } else if (isTarget) {
      related.add(edge.source);
    } else {
      edge.className = undefined;
      continue;
    }

    let anim: string = cls.animateReadLine;
    if (isSource && edge.data!.write) {
      anim = cls.animateWriteLine;
    } else if (isTarget && edge.data!.write) {
      anim = cls.animateWriteLine;
    }

    edge.className = classNames(cls.show, anim);
  }

  // Update nodes
  for (const node of nodes) {
    if (node.id !== id && !related.has(node.id) && node.parentNode !== id) {
      node.className = node.className
        ? node.className.replace(cls.show, '')
        : '';
      continue;
    }

    node.className = node.className?.includes(cls.show)
      ? node.className
      : classNames(node.className, cls.show);
  }
}

export function recomputeHandles(
  node: ComputedNode,
  nodes: ComputedNode[],
  edges: ComputedEdge[]
): void {
  // Move edges source and target handles depending on the node position
  for (const edge of edges) {
    if (edge.source !== node.id && edge.target !== node.id) {
      // Only check relevant edges
      continue;
    }

    // Get new handles' position
    let c: ReturnType<typeof getBestHandlePosition>;
    if (edge.target === node.id) {
      c = getBestHandlePosition(nodes.find((n) => n.id === edge.source)!, node);
    } else {
      c = getBestHandlePosition(node, nodes.find((n) => n.id === edge.target)!);
    }

    if (
      mapSourceHandle[edge.sourceHandle as FlowEdge['portSource']] ===
        c.newSource &&
      mapTargetHandle[edge.targetHandle as FlowEdge['portTarget']] ===
        c.newTarget
    ) {
      // no change we skip an useless update
      continue;
    }

    edge.sourceHandle = mapSourceHandleReverse[c.newSource];
    edge.targetHandle = mapTargetHandleReverse[c.newTarget];
  }
}
