import type { ComputedFlow } from '@specfy/api/src/common/flow/types';
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
} from 'reactflow';
import type { NodeTypes, ReactFlowInstance, ReactFlowProps } from 'reactflow';

import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import type { OnNodesChangeSuper } from './helpers';
import { highlightNode } from './helpers';
import cls from './index.module.scss';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

export const Flow: React.FC<{
  flow: ComputedFlow;
  readonly?: boolean;
  highlight?: string;
  downlightOther?: boolean;
  keepHighlightOnSelect?: boolean;

  // Events
  onNodesChange?: OnNodesChangeSuper;
  onEdgesChange?: ReactFlowProps['onEdgesChange'];
  onConnect?: ReactFlowProps['onConnect'];
  onCreateNode?: (
    type: 'hosting' | 'service',
    position: { x: number; y: number }
  ) => string;
}> = ({
  flow,
  highlight,
  readonly,
  downlightOther,
  keepHighlightOnSelect,
  onNodesChange,
  onEdgesChange,
  onConnect,
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
    setEdges((prev) => {
      return flow.edges.map((edge) => {
        const id = `${edge.source}->${edge.target}`;
        const find = prev.find((n) => n.id === id) || edge;
        find.deletable = !readonly;
        find.updatable = !readonly;
        return find;
      });
    });
    setNodes((prev) => {
      return flow.nodes.map((node) => {
        let find = prev.find((n) => n.id === node.id);
        if (!find) {
          find = node;
        } else {
          // Reflect updates
          find.parentNode = node.parentNode;
          find.extent = node.extent;
          find.position = node.position;
        }
        find.deletable = !readonly;
        find.draggable = !readonly;
        find.connectable = !readonly;

        return find;
      });
    });
  }, [readonly, flow]);

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

    // Compute parents list so we don't highlight them
    const parents: string[] = [];
    let parent = node.parentNode;
    while (parent) {
      parents.push(parent);
      parent = getNode(parent)?.parentNode;
    }

    setNodes((nds) => {
      return nds.map((n) => {
        if (n.data.type !== 'hosting' || n.id === node.parentNode) {
          return n;
        }

        // handle deep parent host
        if (parents.includes(n.id)) {
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
      if (nd.className?.includes(cls.highlightToGroup)) {
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

    // The only way to get the absolute position
    const tmp = getNode(last)!;

    // Then we compute new relative position compared to host
    const pos = node.position;
    const position = {
      x:
        pos.x < tmp.position.x
          ? 0
          : pos.x + node.width! > tmp.position.x + tmp.width!
          ? tmp.width! - node.width!
          : pos.x - tmp.position.x,
      y:
        pos.y < tmp.position.y
          ? 0
          : pos.y + node.height! > tmp.position.y + tmp.height!
          ? tmp.height! - node.height!
          : pos.y - tmp.position.y,
    };
    onNodesChange!([
      {
        type: 'group',
        id: node.id,
        parentId: tmp.id,
        position,
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
        snapToGrid
        snapGrid={[5, 5]}
        proOptions={{ hideAttribution: true }}
        elevateEdgesOnSelect={true}
        elevateNodesOnSelect={true}
        // Drag
        onInit={setReactFlowInstance}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        // Bubbled
        onConnect={onConnect}
        onNodesChange={(changes) => {
          handleNodesChange(changes);
          if (onNodesChange) onNodesChange(changes);
        }}
        onEdgesChange={(changes) => {
          handleEdgesChange(changes);
          if (onEdgesChange) onEdgesChange(changes);
        }}
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
}> = ({ children, style }) => {
  return (
    <div className={cls.container} style={style}>
      {children}
    </div>
  );
};
