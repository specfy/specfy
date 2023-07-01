import type { ComputedFlow } from '@specfy/api/src/common/flow/types';
import classNames from 'classnames';
import type { CSSProperties } from 'react';
import { useState, useEffect } from 'react';
import type { NodeTypes, ReactFlowProps } from 'reactflow';
import {
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  ReactFlow,
  Background,
  ConnectionMode,
} from 'reactflow';

import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
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
  onNodesChange?: ReactFlowProps['onNodesChange'];
  onEdgesChange?: ReactFlowProps['onEdgesChange'];
  onConnect?: ReactFlowProps['onConnect'];
}> = ({
  flow,
  highlight,
  readonly,
  downlightOther,
  keepHighlightOnSelect,
  onNodesChange,
  onEdgesChange,
  onConnect,
}) => {
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
    console.log(readonly);
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
        const find = prev.find((n) => n.id === node.id) || node;
        find.deletable = !readonly;
        find.draggable = !readonly;
        find.connectable = !readonly;

        return find;
      });
    });
  }, [readonly, flow]);

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

  return (
    <div
      style={{ width: '100%', height: `100%` }}
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
  children: React.ReactElement | React.ReactElement[];
  style?: CSSProperties;
}> = ({ children, style }) => {
  return (
    <div className={cls.container} style={style}>
      {children}
    </div>
  );
};
