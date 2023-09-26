import classNames from 'classnames';
import { useRef, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  ReactFlow,
  SelectionMode,
  useStoreApi,
} from 'reactflow';

import { useFlowStore } from '@/common/store';

import CustomNode from './CustomNode';
import cls from './index.module.scss';

import type { NodeTypes, ReactFlowInstance } from 'reactflow';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

export const FlowOrg: React.FC = () => {
  const {
    readOnly,
    nodes,
    edges,
    highlightId,
    onNodesChange,
    onEdgesChange,
    onSelectionChange,
    onNodeMouseEnter,
    onNodeMouseLeave,
  } = useFlowStore();
  const store = useStoreApi();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  return (
    <div
      style={{ width: '100%', height: `100%` }}
      ref={reactFlowWrapper}
      className={classNames(
        cls.flow,
        readOnly && cls.readonly,
        cls.hasHighlight,
        highlightId && cls.downlightOther
      )}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        minZoom={0.2}
        maxZoom={3}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ maxZoom: 1.3 }}
        connectionMode={ConnectionMode.Loose}
        connectionRadius={200}
        autoPanOnConnect={true}
        snapToGrid={false}
        snapGrid={[2, 2]}
        proOptions={{ hideAttribution: true }}
        elevateEdgesOnSelect={true}
        elevateNodesOnSelect={true}
        selectionMode={SelectionMode.Partial}
        // Drag
        onInit={setReactFlowInstance}
        // Global
        onNodesChange={onNodesChange(store)}
        onEdgesChange={onEdgesChange}
        onSelectionChange={onSelectionChange}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
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
