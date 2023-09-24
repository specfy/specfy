/* eslint-disable import/extensions */
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

import { autoExpand } from '@/components/Flow/helpers/autoExpand';
import cls from '@/components/Flow/index.module.scss';
import type {
  OnEdgesChangeSuper,
  OnNodesChangeSuper,
} from '@/components/Flow/types';

export interface FlowState {
  // id is used to control loading state
  id: string;

  // Flow
  nodes: ComputedNode[];
  edges: ComputedEdge[];
  setCurrent: (id: string, flow: ComputedFlow) => void;

  // Meta
  deletable: boolean;
  connectable: boolean;
  readOnly: boolean;
  setMeta: (
    opts: Partial<{
      readOnly: boolean;
      deletable: boolean;
      connectable: boolean;
    }>
  ) => void;

  // Highlight state
  highlightId: string | null;
  setHighlight: (id: string | null) => void;

  // Everything else
  nodeSelected: string | null;
  edgeSelected: string | null;
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
  id: '',
  nodes: [],
  edges: [],
  deletable: false,
  connectable: false,
  nodeSelected: null,
  edgeSelected: null,
  readOnly: true,
  highlightId: null,
  setCurrent: (id, flow) => {
    set(
      produce((state) => {
        state.id = id;
        state.nodes = flow.nodes.map((n) => {
          return { ...n };
        });
        state.edges = flow.edges.map((e) => {
          return { ...e };
        });

        for (const node of flow.nodes) {
          addMetaToNode(node, state);
        }
        for (const edge of flow.edges) {
          addMetaToEdge(edge, state);
        }
      })
    );
  },
  setHighlight: (id) => {
    set(
      produce((state: FlowState) => {
        highlightNode(id || 'nope', state.nodes, state.edges);
        state.highlightId = id;
      })
    );
  },
  setMeta: ({ readOnly, connectable, deletable }) => {
    set(
      produce((state: FlowState) => {
        if (typeof readOnly === 'boolean') state.readOnly = readOnly;
        if (typeof connectable === 'boolean') state.connectable = connectable;
        if (typeof deletable === 'boolean') state.deletable = deletable;

        for (const node of state.nodes) {
          addMetaToNode(node, state);
        }
        for (const edge of state.edges) {
          addMetaToEdge(edge, state);
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
                nodes.push({
                  ...change.item,
                  deletable: state.readOnly && state.deletable,
                  draggable: !state.readOnly,
                  connectable: state.readOnly && state.connectable,
                  focusable: true,
                  selectable: true,
                });
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

                // We need absolute position
                const internals = store.getState().nodeInternals;
                recomputeHandles(
                  internals.get(change.id)!,
                  Array.from(internals.values()),
                  edges
                );

                if (item.parentNode) {
                  autoExpand(item, nodes);
                }

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
                // In case of KeyPress it will send all the childs
                // But in case of manual delete we will only send the current el
                const nodeIds = [
                  ...listAllChildren(state.nodes, change.id),
                  change.id,
                ];
                // Delete childs
                for (let index = 0; index < state.nodes.length; index++) {
                  if (nodeIds.includes(state.nodes[index].id)) {
                    delete state.nodes[index];
                  }
                }
                state.nodeSelected = null;
                // // Delete all related edges
                // for (let index = 0; index < edges.length; index++) {
                //   if (
                //     nodeIds.includes(edges[index].source) ||
                //     nodeIds.includes(edges[index].target)
                //   ) {
                //     delete edges[index];
                //   }
                // }
                break;
              }

              case 'visibility': {
                const node = nodes.find((c) => c.id === change.id);
                if (!node) {
                  return;
                }

                const visible = node.hidden === false;
                const nodeIds = [...listAllChildren(nodes, node.id), change.id];

                // Hide all children and self
                for (const copy of nodes) {
                  if (nodeIds.includes(copy.id)) {
                    copy.hidden = visible;
                  }
                }

                // Hide any incoming edges
                for (const edge of edges) {
                  if (
                    nodeIds.includes(edge.source) ||
                    nodeIds.includes(edge.target)
                  ) {
                    edge.hidden = visible;
                  }
                }
              }
            }

            // Clear out delete because undefined
            state.edges = state.edges.filter(Boolean);
            state.nodes = state.nodes.filter(Boolean);
          }
        })
      );
    };
  },
  onEdgesChange: (changes) => {
    set(
      produce((state: FlowState) => {
        for (const change of changes) {
          switch (change.type) {
            case 'add': {
              console.log('add', change);
              break;
            }

            case 'changeTarget': {
              const edge = state.edges.find((e) => e.id === change.id)!;
              edge.targetHandle = change.newTargetHandle;
              edge.sourceHandle = change.newSourceHandle;
              break;
            }

            case 'remove': {
              const index = state.edges.findIndex(
                (e) => e && e.id === change.id
              )!;
              delete state.edges[index];
              state.edgeSelected = null;
              break;
            }

            case 'create': {
              console.log('create', change);
              const rel = change.conn;
              state.edges.push({
                id: `${rel.source}->${rel.target}`,
                data: {
                  read: true,
                  write: true,
                  source: null,
                },
                source: rel.source!,
                sourceHandle: rel.sourceHandle!,
                target: rel.target!,
                targetHandle: rel.targetHandle,
              });
              break;
            }

            case 'direction': {
              const item = state.edges.find((e) => e.id === change.id)!;
              item.data!.read = change.read;
              item.data!.write = change.write;
              break;
            }

            case 'select': {
              state.edgeSelected = change.selected ? change.id : null;
              const item = state.edges.find((n) => n.id === change.id)!;
              item.selected = change.selected;
              break;
            }

            case 'visibility': {
              const item = state.edges.find((n) => n.id === change.id)!;
              item.hidden = item.hidden ? false : true;
              break;
            }
          }

          // Clear out delete because undefined
          state.edges = state.edges.filter(Boolean);
        }
      })
    );
  },
  onSelectionChange: (opts) => {
    set(
      produce((state: FlowState) => {
        if (opts.nodes.length !== 1) {
          state.nodeSelected = null;
          highlightNode(state.highlightId || 'nope', state.nodes, state.edges);
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
        highlightNode(
          state.nodeSelected || state.highlightId || 'nope',
          state.nodes,
          state.edges
        );
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

function listAllChildren(nodes: ComputedNode[], parent: string): string[] {
  const list: string[] = [];
  for (const comp of nodes) {
    if (comp.parentNode === parent) {
      list.push(comp.id);
      if (comp.type === 'hosting') {
        list.push(...listAllChildren(nodes, comp.id));
      }
    }
  }
  return list;
}

function addMetaToNode(node: ComputedNode, state: FlowState) {
  node.deletable = !state.readOnly && state.deletable;
  node.draggable = !state.readOnly;
  node.connectable = !state.readOnly && state.connectable;
  node.focusable = true;
  node.selectable = true;
}
function addMetaToEdge(edge: ComputedEdge, state: FlowState) {
  edge.deletable = !state.readOnly && state.deletable;
  edge.updatable = !state.readOnly && state.connectable;
  edge.focusable = true;
}
