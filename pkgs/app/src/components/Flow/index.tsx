import type { ComputedEdge, ComputedFlow } from '@specfy/models';
import classNames from 'classnames';
import type { CSSProperties } from 'react';
import { useRef, useCallback, useState, useEffect } from 'react';
import {
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  ReactFlow,
  Background,
  ConnectionMode,
  useReactFlow,
  updateEdge,
  SelectionMode,
} from 'reactflow';
import type {
  NodeTypes,
  OnEdgesChange,
  OnNodesChange,
  ReactFlowInstance,
  ReactFlowProps,
} from 'reactflow';

import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import { onDragComputeNewHandle } from './floatingEdge';
import type { OnEdgesChangeSuper, OnNodesChangeSuper } from './helpers';
import { highlightNode } from './helpers';
import cls from './index.module.scss';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

let movingHandle: 'source' | 'target';
let movingEdge: ComputedEdge | undefined;

export const Flow: React.FC<{
  flow: ComputedFlow;
  highlight?: string;
  downlightOther?: boolean;
  keepHighlightOnSelect?: boolean;

  // Readonly
  readonly?: boolean;
  deletable?: boolean;
  connectable?: boolean;

  // Events
  onNodesChange?: OnNodesChangeSuper;
  onEdgesChange?: OnEdgesChangeSuper;
  onCreateNode?: (
    type: 'hosting' | 'service',
    position: { x: number; y: number }
  ) => string;
}> = ({
  flow,
  highlight,
  readonly,
  deletable = true,
  connectable = true,
  downlightOther,
  keepHighlightOnSelect,
  onNodesChange,
  onEdgesChange,
  onCreateNode,
}) => {
  const { getIntersectingNodes, getNode } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [hasHighlight, setHasHighlight] = useState(!!highlight);
  const [hover, setHover] = useState<string | null>(null);
  const [nodes, setNodes, handleNodesChange] = useNodesState(flow.nodes);
  const [edges, setEdges, handleEdgesChange] = useEdgesState(flow.edges);
  const [select, setSelect] = useState<string | null>(null);

  // Highlight change usually means we switched the parent page
  useEffect(() => {
    if (!highlight && !hover) {
      return;
    }

    const updates = highlightNode({
      id: hover || highlight!,
      nodes,
      edges,
    });
    setEdges(updates.edges);
    setNodes(updates.nodes);
  }, [flow.edges, highlight]);

  // We changed the parent page
  useEffect(() => {
    const isDeletable = !readonly && deletable;
    const isConnectable = !readonly && connectable;
    setEdges((prev) => {
      return flow.edges.map((edge) => {
        const id = `${edge.source}->${edge.target}`;
        let find = prev.find((n) => n.id === id);
        if (!find) {
          find = edge;
          find.deletable = isDeletable;
          find.updatable = isConnectable;
          return find;
        }
        return {
          ...find,
          targetHandle: edge.targetHandle,
          sourceHandle: edge.sourceHandle,
          data: edge.data,
          hidden: edge.hidden,
          deletable: isDeletable,
          updatable: isConnectable,
        };
      });
    });

    setNodes((prev) => {
      return flow.nodes.map((node) => {
        let find = prev.find((n) => n.id === node.id);
        if (!find) {
          find = node;
          find.deletable = isDeletable;
          find.draggable = !readonly;
          find.connectable = isConnectable;
          find.focusable = true;
          find.selectable = true;
          return find;
        }

        return {
          ...find,
          deletable: isDeletable,
          draggable: !readonly,
          connectable: isConnectable,
          focusable: true,
          selectable: true,
          parentNode: node.parentNode,
          extent: node.extent,
          position: node.position,
          data: node.data,
          hidden: node.hidden,
        };
      });
    });
  }, [readonly, flow]);

  // --- Updates changes
  const middlewareNodesChange: OnNodesChange = (changes) => {
    if (changes[0].type !== 'remove') {
      // dimensions/position/select needs to be applied right away to avoid flickering
      handleNodesChange(changes);
    }
    if (onNodesChange) {
      onNodesChange(changes);
    }
  };
  const middlewareEdgesChange: OnEdgesChange = (changes) => {
    if (changes[0].type !== 'remove') {
      // dimensions/position/select needs to be applied right away to avoid flickering
      handleEdgesChange(changes);
    }
    if (onEdgesChange) {
      onEdgesChange(changes);
    }
  };

  // --- Highlighting
  const setHighlightNode = (id: string) => {
    const updates = highlightNode({ id, nodes, edges });
    setEdges(updates.edges);
    setNodes(updates.nodes);
    setHasHighlight(true);
    setHover(id);
  };
  const unsetHighlightNode = () => {
    const updates = highlightNode({ id: highlight || 'no', nodes, edges });
    setEdges(updates.edges);
    setNodes(updates.nodes);
    setHasHighlight(!!highlight);
    setHover(null);
  };

  const onNodeEnter: ReactFlowProps['onNodeMouseEnter'] = (_, node) => {
    if (keepHighlightOnSelect && select && node.id !== select) {
      return;
    }

    setHighlightNode(node.id);
  };

  const onNodeLeave: ReactFlowProps['onNodeMouseLeave'] = () => {
    if (keepHighlightOnSelect && select) {
      return;
    }

    unsetHighlightNode();
  };

  const onSelect: ReactFlowProps['onSelectionChange'] = (opts) => {
    if (opts.nodes.length <= 0 || opts.nodes.length > 1) {
      if (select) {
        unsetHighlightNode();
      }
      setSelect(null);
      return;
    }
    if (select === opts.nodes[0].id) {
      return;
    }

    setSelect(opts.nodes[0].id);
    setHighlightNode(opts.nodes[0].id);
  };

  // --- Dragging
  // Before dragging a new node is over
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // When we finishing dropping a new node
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!reactFlowWrapper.current || !reactFlowInstance || !onCreateNode) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const id = onCreateNode(type as any, position);
      // TODO: auto select
      console.log('created', id);
    },
    [reactFlowInstance]
  );

  // --- Grouping
  // We move the node around
  const onNodeDrag: ReactFlowProps['onNodeDrag'] = (_, node) => {
    const intersections = getIntersectingNodes(node).map((n) => n.id);

    const exclude: string[] = [node.id];

    // Compute parents list so we don't highlight them
    let parent = node.parentNode;
    while (parent) {
      exclude.push(parent);
      parent = getNode(parent)?.parentNode;
    }

    // Compute childs too
    for (const n of nodes) {
      if (n.data.type !== 'hosting') continue;
      if (exclude.includes(n.id)) continue;

      const chains = [n.id];
      let par = n.parentNode;
      let i = 0;
      while (par && i < 9999) {
        i += 1;

        // One of the parent of this node is the original node we are moving
        if (par === node.id) {
          exclude.push(...chains);
          break;
        }

        chains.push(par);
        par = getNode(par)?.parentNode;
      }
    }

    const edgeUpdates = onDragComputeNewHandle(node, edges, getNode);
    if (edgeUpdates.length > 0) {
      onEdgesChange!(edgeUpdates);
    }

    setNodes((nds) => {
      return nds.map((n) => {
        if (n.data.type !== 'hosting') {
          return n;
        }

        // handle deep parent/child host
        if (exclude.includes(n.id)) {
          return n;
        }

        return {
          ...n,
          className: intersections.includes(n.id) ? cls.highlightToGroup : '',
        };
      });
    });
  };

  const onNodeDragStop: ReactFlowProps['onNodeDragStop'] = (_, node) => {
    let last: string | undefined;

    // Find potential hosts
    nodes.forEach((nd) => {
      if (nd.className?.includes(cls.highlightToGroup) && !nd.hidden) {
        last = nd.id;
      }
    });

    if (!last) {
      // Drag also trigger on click so there is a good chance we didn't found anything
      return;
    }

    // Remove highlight from hosts
    setNodes((nds) => {
      return nds.map((nd) => {
        return {
          ...nd,
          className: nd.className?.replace(cls.highlightToGroup, ''),
        };
      });
    });

    onNodesChange!([
      {
        type: 'group',
        id: node.id,
        parentId: last,
      },
    ]);
  };

  // ---- Edges
  const onEdgeUpdateStart: ReactFlowProps['onEdgeUpdateStart'] = (
    _,
    edge,
    handleType
  ) => {
    // Not sure why it's the opposite
    movingHandle = handleType === 'source' ? 'target' : 'source';
    movingEdge = edge;
    setNodes((prev) => {
      return prev.map((nde) => {
        if (nde.id === edge.source) {
          nde.data.moving = movingHandle;
          return nde;
        }
        if (nde.id === edge.target) {
          nde.data.moving = handleType;
          return nde;
        }
        return nde;
      });
    });
  };

  const onEdgeUpdate: ReactFlowProps['onEdgeUpdate'] = async (
    prevEdge,
    newEdge
  ) => {
    // Because we update from top -> down, the update will take one cycle to reach here again creating flickering
    // So we need to replicate the change in reactflow first, then in our store
    setEdges((els) =>
      updateEdge(prevEdge, newEdge, els, { shouldReplaceId: false })
    );

    if (!onEdgesChange) {
      console.error('Edge changed but no function was registered');
      return;
    }
    movingEdge = undefined;
    // We change the target and sourceHandle
    onEdgesChange([
      {
        type: 'changeTarget',
        id: prevEdge.id,
        source: newEdge.source!,
        newSourceHandle: newEdge.sourceHandle!,
        oldTarget: prevEdge.target,
        newTarget: newEdge.target!,
        newTargetHandle: newEdge.targetHandle!,
        show: true,
      },
    ]);
  };

  const isValidConnection: ReactFlowProps['isValidConnection'] = (conn) => {
    // Project scenario, we are allowed to move source and target around
    // TODO: reup this
    // if (onEdgesChange) {
    //   if (movingHandle === 'source') {
    //     return conn.sourceHandle!.startsWith('s');
    //   }
    //   return conn.targetHandle!.startsWith('t');
    // }

    // New connection
    if (!movingEdge) {
      return conn.source !== conn.target && conn.targetHandle!.startsWith('t');
    }

    // Moving an existing connection
    // In organisation we are only allowed to move the source and target within the same Node
    if (movingHandle === 'source') {
      return (
        conn.source === movingEdge.source && conn.sourceHandle!.startsWith('s')
      );
    }

    return (
      conn.target === movingEdge.target && conn.targetHandle!.startsWith('t')
    );
  };

  const onAddEdge: ReactFlowProps['onConnect'] = (conn) => {
    if (!onEdgesChange) {
      console.error('Edge changed but no function was registered');
      return;
    }

    const exists = edges.find(
      (edge) => edge.target === conn.target && edge.source === conn.source
    );
    movingEdge = undefined;
    if (exists) {
      // Adding an edge that already exists (e.g: same or different handle but same source / target)
      onEdgesChange([
        {
          type: 'changeTarget',
          id: `${conn.source}->${conn.target}`,
          source: conn.source!,
          newSourceHandle: conn.sourceHandle!,
          newTarget: conn.target!,
          newTargetHandle: conn.targetHandle!,
          oldTarget: conn.target!,
          show: true, // In might have been hidden and the person think it doesn't exists
        },
      ]);
      return;
    }

    onEdgesChange([
      {
        type: 'create',
        conn,
      },
    ]);
  };

  return (
    <div
      style={{ width: '100%', height: `100%` }}
      ref={reactFlowWrapper}
      className={classNames(
        cls.flow,
        hasHighlight && cls.hasHighlight,
        downlightOther !== false && cls.downlightOther,
        readonly && cls.readonly
      )}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        minZoom={0.2}
        maxZoom={3}
        onNodeMouseEnter={onNodeEnter}
        onNodeMouseLeave={onNodeLeave}
        onSelectionChange={onSelect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ maxZoom: 1.3 }}
        connectionMode={ConnectionMode.Loose}
        connectionRadius={50}
        autoPanOnConnect={true}
        snapToGrid={false}
        // snapGrid={[2, 2]}
        proOptions={{ hideAttribution: true }}
        elevateEdgesOnSelect={true}
        elevateNodesOnSelect={true}
        selectionMode={SelectionMode.Partial}
        // --- Events that are bubble
        // Edges
        onEdgeUpdateStart={onEdgeUpdateStart}
        onEdgeUpdate={onEdgeUpdate}
        onConnect={onAddEdge}
        isValidConnection={isValidConnection}
        // Drag
        onInit={setReactFlowInstance}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        // Global
        onNodesChange={middlewareNodesChange}
        onEdgesChange={middlewareEdgesChange}
      >
        <Background id="1" gap={10} color="#c5c7ca" />
        <Background
          id="2"
          gap={200}
          color="#f3f4f6"
          variant={BackgroundVariant.Lines}
        />
      </ReactFlow>
    </div>
  );
};

export const FlowWrapper: React.FC<{
  children: React.ReactNode;
  style?: CSSProperties;
  columnMode?: boolean;
}> = ({ children, style, columnMode }) => {
  return (
    <div
      className={classNames(cls.container, columnMode && cls.columnMode)}
      style={style}
    >
      {children}
    </div>
  );
};
