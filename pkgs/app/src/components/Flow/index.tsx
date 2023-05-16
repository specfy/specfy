import type { CSSProperties } from 'react';
import type { NodeTypes } from 'reactflow';
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
import type { ComputedFlow } from './helpers';
import cls from './index.module.scss';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};
// const edgeTypes: EdgeTypes = {
//   floating: SimpleFloatingEdge,
// };

export const Flow: React.FC<{ flow: ComputedFlow; readonly?: true }> = ({
  flow,
  readonly,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(flow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow.edges);

  return (
    <div style={{ width: '100%', height: `100%` }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        minZoom={0.2}
        maxZoom={3}
        // onConnect={onConnect}
        nodeTypes={nodeTypes}
        // edgeTypes={edgeTypes}
        fitView
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
      >
        <Background id="1" gap={10} color="#d1d5db" />
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
