import { isHosting } from '@specfy/models/src/components/isHosting';
import { produce } from 'immer';
import { create } from 'zustand';

import type { ComputedEdge, ComputedFlow, ComputedNode } from '@specfy/models';

import type {
  OnEdgesChangeSuper,
  OnNodesChangeSuper,
} from '@/components/Flow/types';

import { autoExpand } from './autoExpand';
import { highlightNode } from './highlightNode';
import { recomputeHandles } from './recomputeHandles';
import { setParentsToHighlight } from './setParentsToHighlight';

import type {
  NodeMouseHandler,
  OnSelectionChangeFunc,
  useStoreApi,
} from 'reactflow';

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
  highlightHoveredParents: (
    node: ComputedNode,
    intersections: string[]
  ) => void;
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
                const node: ComputedNode = { ...change.item };
                addMetaToNode(node, state);
                state.nodes.push(node);
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
                const item = state.nodes.find((n) => n.id === change.id);
                if (!item) {
                  // We delete childs manually to have the chance to hide them
                  // So might receive multiple "remove" update but only the first one is relevant
                  continue;
                }

                // Delete childs
                for (let index = 0; index < state.nodes.length; index++) {
                  const node = state.nodes[index];
                  if (!nodeIds.includes(node.id)) {
                    continue;
                  }

                  if (node.data.source) {
                    node.hidden = true;
                  } else {
                    delete state.nodes[index];
                  }
                }

                state.nodes = state.nodes.filter(Boolean);

                // Because we can have hidden a node but delete its host, we need to double check after the facts
                for (const node of state.nodes) {
                  if (
                    node.parentNode &&
                    !state.nodes.find((n) => n.id === node.parentNode)
                  ) {
                    node.parentNode = undefined;
                  }
                }

                state.nodeSelected = null;
                break;
              }

              case 'visibility': {
                const node = nodes.find((c) => c.id === change.id);
                if (!node) {
                  continue;
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

                break;
              }

              case 'tech': {
                const node = nodes.find((c) => c.id === change.id)!;
                const tech = change.tech;
                if (!tech) {
                  node.data.techId = null;
                  node.data.typeId = null;
                  node.data.type = 'service';
                } else if (tech.type === 'project') {
                  node.data.techId = null;
                  node.data.typeId = tech.project.id;
                  node.data.type = 'project';
                  node.data.name = tech.project.name;
                } else if (tech.type === 'tech') {
                  node.data.techId = tech.tech.key;
                  node.data.typeId = null;
                  node.data.type = tech.tech.type;
                  node.data.name =
                    node.data.name === 'untitled' || node.data.name === ''
                      ? tech.tech.name
                      : node.data.name;
                } else if (tech.type === 'create') {
                  node.data.techId = 'unknown';
                  node.data.typeId = null;
                  node.data.type = 'api';
                  node.data.name = tech.label;
                }
                break;
              }

              case 'rename': {
                const node = nodes.find((c) => c.id === change.id)!;
                node.data.name = change.name;

                break;
              }

              case 'group': {
                if (change.id === change.parentId) {
                  console.error('Try to host inside itself', change);
                  continue;
                }

                const node = nodes.find((c) => c.id === change.id)!;
                node.parentNode = change.parentId;
                const internals = store.getState().nodeInternals;
                const up = getPositionInParent(
                  internals.get(change.id)!,
                  internals.get(change.parentId)!
                );
                node.position = up.child;

                // Adapt host size
                autoExpand(node, state.nodes);
                // Un-highlight host
                setParentsToHighlight(node, state.nodes, []);
                break;
              }

              case 'ungroup': {
                const node = nodes.find((c) => c.id === change.id)!;
                node.parentNode = undefined;
                const internal = store.getState().nodeInternals.get(change.id)!;
                // Slight change to avoid sending the node flying away
                // But enough change to make it clear something happened
                node.position = {
                  x: internal.positionAbsolute!.x - 10,
                  y: internal.positionAbsolute!.y - 10,
                };
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
              console.error('add', change);
              break;
            }

            case 'changeTarget': {
              const edge = state.edges.find((e) => e.id === change.id)!;
              edge.targetHandle = change.newTargetHandle;
              edge.sourceHandle = change.newSourceHandle;
              edge.hidden = false;
              break;
            }

            case 'remove': {
              const index = state.edges.findIndex(
                (e) => e && e.id === change.id
              )!;
              const item = state.edges[index];
              const source = state.nodes.find((n) => n.id === item.source)!;
              // If edges is managed or source is managed (in that case we are hiding)
              if (item.data?.source || source.data.source) {
                item.hidden = true;
                state.edgeSelected = null;
                continue;
              }

              delete state.edges[index];
              state.edgeSelected = null;
              break;
            }

            case 'create': {
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
  highlightHoveredParents: (node, intersections) => {
    set(
      produce((state: FlowState) => {
        setParentsToHighlight(node, state.nodes, intersections);
      })
    );
  },
}));

function listAllChildren(nodes: ComputedNode[], parent: string): string[] {
  const list: string[] = [];
  for (const comp of nodes) {
    if (comp.parentNode !== parent) {
      continue;
    }

    list.push(comp.id);
    if (isHosting(comp.data.type)) {
      list.push(...listAllChildren(nodes, comp.id));
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

function getPositionInParent(node: ComputedNode, parent: ComputedNode) {
  const absChild = node.positionAbsolute!;
  const absParent = parent.positionAbsolute!;

  const x = Math.abs(absParent.x - absChild.x);
  const y = Math.abs(absParent.y - absChild.y);

  return { child: { x, y } };
}
