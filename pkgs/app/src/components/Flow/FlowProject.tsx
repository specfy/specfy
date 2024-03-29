import { nanoid } from '@specfy/core/src/id';
import { getComponentSize } from '@specfy/models/src/flows/helpers';
import classNames from 'classnames';
import { useCallback, useRef, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  ReactFlow,
  SelectionMode,
  useReactFlow,
  useStoreApi,
} from 'reactflow';

import type { ComputedNode } from '@specfy/models';

import { useFlowStore } from '@/common/store';

import CustomNode from './CustomNode';
import cls from './index.module.scss';

import type { NodeTypes, ReactFlowInstance, ReactFlowProps } from 'reactflow';

const nodeTypes: NodeTypes = { custom: CustomNode };

export const FlowProject: React.FC = () => {
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
    highlightHoveredParents,
  } = useFlowStore();
  const store = useStoreApi();
  const { getIntersectingNodes } = useReactFlow();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  // ------------------ Dragging Node
  //
  const onNodeDrag: ReactFlowProps['onNodeDrag'] = (_evt, node) => {
    // Highlight hosts where you can drop the node
    // /!\ Slowest interactions
    const intersections = getIntersectingNodes(node).map((n) => n.id);
    highlightHoveredParents(node, intersections);
  };

  const onNodeDragStop: ReactFlowProps['onNodeDragStop'] = (_, node) => {
    let last: string | undefined;

    // Find potential hosts
    nodes.forEach((nd) => {
      if (
        nd.className?.includes(cls.highlightToGroup) &&
        !nd.hidden &&
        nd.id !== node.id
      ) {
        last = nd.id;
      }
    });

    if (!last) {
      // Drag also trigger on click so there is a good chance we didn't found anything
      return;
    }

    onNodesChange(store)([{ type: 'group', id: node.id, parentId: last }]);
  };

  //
  // --------- Dragging new Node
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
      style: { width: size.width, height: size.height },
      width: size.width,
      height: size.height,
      hidden: false,
    };
    onNodesChange(store)([{ type: 'add', item: node }]);
  };

  // ------------------ Edge
  //
  const onAddEdge: ReactFlowProps['onConnect'] = (conn) => {
    const exists = edges.find(
      (edge) => edge.target === conn.target && edge.source === conn.source
    );
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

    onEdgesChange([{ type: 'create', conn }]);
  };
  const isValidConnection: ReactFlowProps['isValidConnection'] = (conn) => {
    if (
      conn.sourceHandle?.startsWith('t') ||
      conn.targetHandle?.startsWith('s')
    ) {
      return false;
    }
    if (conn.source === conn.target) {
      return false;
    }
    return true;
  };

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
        // onEdgeUpdate not needed at this moment
        onConnect={onAddEdge}
        isValidConnection={isValidConnection}
        // Nodes
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
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
