import classNames from 'classnames';
import { useRef, useState } from 'react';
import type { NodeTypes, ReactFlowInstance } from 'reactflow';
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  ReactFlow,
  SelectionMode,
  useStoreApi,
} from 'reactflow';

import CustomNode from './CustomNode';
import cls from './index.module.scss';
import type { OnEdgesChangeSuper, OnNodesChangeSuper } from './types';

import { useFlowStore } from '@/common/store';

export interface Props {
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
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

export const FlowV2: React.FC<Props> = ({ readonly }) => {
  const {
    nodes,
    edges,
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
        readonly && cls.readonly,
        cls.hasHighlight
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
