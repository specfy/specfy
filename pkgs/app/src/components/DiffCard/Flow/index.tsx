import { pick } from '@specfy/api/src/common/object';
import type {
  ComputedEdge,
  ComputedFlow,
  ComputedNode,
} from '@specfy/api/src/models/flows/types';
import classNames from 'classnames';
import { useEffect, useRef } from 'react';
import type { NodeTypes } from 'reactflow';
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from 'reactflow';

import { isDiffSimple } from '../../../common/diff/helpers';
import CustomNode from '../../Flow/CustomNode';

import cls from './index.module.scss';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

// Fields to determine if they have changed
const fieldsNode: Array<keyof ComputedNode> = [
  'data',
  'position',
  'width',
  'height',
];
const fieldsEdge: Array<keyof ComputedEdge> = [
  'data',
  'sourceHandle',
  'targetHandle',
];

export const DiffFlow: React.FC<{
  next: ComputedFlow;
  prev: ComputedFlow;
}> = ({ next, prev }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useNodesState(next.nodes);
  const [edges, setEdges] = useEdgesState(next.edges);

  useEffect(() => {
    const nodesChanged = new Map<string, 'created' | 'modified'>();
    const nodesDeleted: ComputedNode[] = [];
    const edgesChanged = new Map<string, 'created' | 'modified'>();
    const edgesDeleted: ComputedEdge[] = [];

    // Diff nodes
    for (const node of prev.nodes) {
      const newNode = next.nodes.find((n) => n.id === node.id);
      if (!newNode) {
        nodesDeleted.push(node);
        continue;
      }
      if (isDiffSimple(pick(node, fieldsNode), pick(newNode, fieldsNode))) {
        nodesChanged.set(node.id, 'modified');
      }
    }
    for (const node of next.nodes) {
      const oldNode = prev.nodes.find((n) => n.id === node.id);
      if (oldNode) {
        continue;
      }
      nodesChanged.set(node.id, 'created');
    }

    // Diff edges
    for (const edge of prev.edges) {
      const newEdge = next.edges.find((n) => n.id === edge.id);
      if (!newEdge) {
        edgesDeleted.push(edge);
        continue;
      }
      if (isDiffSimple(pick(edge, fieldsEdge), pick(newEdge, fieldsEdge))) {
        edgesChanged.set(edge.id, 'modified');
      }
    }
    for (const edge of next.edges) {
      const oldEdge = prev.edges.find((n) => n.id === edge.id);
      if (oldEdge) {
        continue;
      }
      edgesChanged.set(edge.id, 'created');
    }

    setNodes(() => {
      const list = next.nodes.map((node) => {
        node.deletable = false;
        node.draggable = false;
        node.connectable = false;
        node.focusable = false;
        node.selectable = false;
        const change = nodesChanged.get(node.id);
        node.className = classNames(
          change === 'created' && cls.nodeCreated,
          change === 'modified' && cls.nodeModified,
          !change && cls.unmodified
        );

        return node;
      });

      for (const node of nodesDeleted) {
        list.push({
          ...node,
          deletable: false,
          draggable: false,
          connectable: false,
          focusable: false,
          selectable: false,
          className: cls.nodeDeleted,
        });
      }

      return list;
    });

    setEdges(() => {
      const list = next.edges.map((edge) => {
        edge.deletable = false;
        edge.updatable = false;
        edge.focusable = false;
        const change = edgesChanged.get(edge.id);
        edge.className = classNames(
          change === 'created' && cls.edgeCreated,
          change === 'modified' && cls.edgeModified,
          !change && cls.unmodified
        );
        return edge;
      });

      for (const edge of edgesDeleted) {
        list.push({
          ...edge,
          deletable: false,
          updatable: false,
          focusable: false,
          className: cls.edgeDeleted,
        });
      }

      return list;
    });
  }, [prev, next]);

  return (
    <div style={{ width: '100%', height: `100%` }} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        minZoom={0.2}
        maxZoom={3}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ maxZoom: 1.3 }}
        connectionMode={ConnectionMode.Loose}
        connectionRadius={50}
        autoPanOnConnect={false}
        snapToGrid={false}
        proOptions={{ hideAttribution: true }}
        zoomOnScroll={true}
        zoomOnDoubleClick={false}
        zoomOnPinch={false}
        panOnDrag={true}
        panOnScroll={false}
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
