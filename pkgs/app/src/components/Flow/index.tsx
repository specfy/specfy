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
// const edgeTypes: EdgeTypes = {
//   floating: SimpleFloatingEdge,
// };

export const Flow: React.FC<{
  flow: ComputedFlow;
  readonly?: true;
  highlight?: string;
  downlightOther?: boolean;
  keepHighlightOnSelect?: boolean;
}> = ({ flow, highlight, readonly, downlightOther, keepHighlightOnSelect }) => {
  const [hasHighlight, setHasHighlight] = useState(!!highlight);
  const [nodes, setNodes, onNodesChange] = useNodesState(flow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow.edges);
  const [select, setSelect] = useState<string | null>(null);

  useEffect(() => {
    if (!highlight) {
      return;
    }

    const updates = highlightNode({ id: highlight, nodes, edges });

    setEdges(updates.edges);
    setNodes(updates.nodes);
  }, [highlight]);

  useEffect(() => {
    setEdges((prev) => {
      return flow.edges.map((edge) => {
        const id = `${edge.source}->${edge.target}`;
        const f = prev.find((n) => n.id === id);
        if (!f) {
          return edge;
        }
        return { ...edge, className: f.className };
      });
    });
    setNodes((prev) => {
      return flow.nodes.map((node) => {
        const f = prev.find((n) => n.id === node.id);
        if (!f) {
          return node;
        }
        return { ...node, className: f.className };
      });
    });
  }, [flow]);

  const setHighlightNode = (id: string) => {
    const updates = highlightNode({ id, nodes, edges });
    setEdges(updates.edges);
    setNodes(updates.nodes);
    setHasHighlight(true);
  };
  const unsetHighlightNode = () => {
    const updates = highlightNode({ id: highlight || 'no', nodes, edges });
    setEdges(updates.edges);
    setNodes(updates.nodes);
    setHasHighlight(!!highlight);
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

  const onEdgesDelete: ReactFlowProps['onEdgesDelete'] = (del) => {
    console.log('edge deleted', del);
  };

  const onSelect: ReactFlowProps['onSelectionChange'] = (opts) => {
    if (opts.nodes.length <= 0 || opts.nodes.length > 1) {
      if (select) {
        unsetHighlightNode();
      }
      setSelect(null);
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
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        minZoom={0.2}
        maxZoom={3}
        onNodeMouseEnter={onNodeEnter}
        onNodeMouseLeave={onNodeLeave}
        onSelectionChange={onSelect}
        // onConnect={onConnect}
        nodeTypes={nodeTypes}
        // edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ maxZoom: 1.3 }}
        connectionMode={ConnectionMode.Loose}
        // isValidConnection={isValidConnection}
        // onNodeDrag={onNodeDrag}
        // onNodeDragStop={onNodeDrop}
        snapToGrid
        snapGrid={[5, 5]}
        nodesDraggable={!readonly}
        nodesConnectable={!readonly}
        elementsSelectable={!readonly}
        proOptions={{ hideAttribution: true }}
        onEdgesDelete={onEdgesDelete}
        elevateEdgesOnSelect={true}
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
