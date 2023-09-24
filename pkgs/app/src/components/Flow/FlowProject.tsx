import { nanoid } from '@specfy/core/src/id';
import type { ComputedNode } from '@specfy/models';
import { getComponentSize } from '@specfy/models/src/flows/helpers';
import classNames from 'classnames';
import { useCallback, useRef, useState } from 'react';
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

export const FlowProject: React.FC<Props> = ({ readonly }) => {
  const {
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
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  // ------------------ Node
  //

  //
  // --------- Dragging
  // Before dragging a new node is over
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // When we finishing dropping a new node
  const onDrop: React.DragEventHandler<HTMLDivElement> = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    if (!reactFlowWrapper.current || !reactFlowInstance) {
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

    const size = getComponentSize(type as any, 'untitled');
    const node: ComputedNode = {
      id: nanoid(),
      type: 'custom',
      data: {
        name: 'untitled',
        techId: null,
        type: type as any,
        typeId: null,
        originalSize: size,
      },
      position: position,
      style: {
        width: size.width,
        height: size.height,
      },
      width: size.width,
      height: size.height,
      hidden: false,
    };
    onNodesChange(store)([{ type: 'add', item: node }]);
  };

  // ------------------ Edge
  //

  return (
    <div
      style={{ width: '100%', height: `100%` }}
      ref={reactFlowWrapper}
      className={classNames(
        cls.flow,
        readonly && cls.readonly,
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
        onInit={setReactFlowInstance}
        // Drag
        onDragOver={onDragOver}
        onDrop={onDrop}
        // Global
        onNodesChange={onNodesChange(store)}
        onEdgesChange={onEdgesChange}
        onSelectionChange={onSelectionChange}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        // Edges
        // Nodes
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
