import type { Edge, Node } from 'reactflow';

import type { ApiComponent } from '../../types/api/index.js';
import type { FlowEdge, FlowItemDisplay } from '../../types/db/index.js';

export interface LayoutNode {
  id: string;
  pos: { x: number; y: number };
  size: { width: number; height: number };
}

export interface Layout {
  nodes: LayoutNode[];
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Tree {
  id: string;
  parentId: string | null;
  childs: Tree[];
}

export type ComponentForFlow = Pick<
  ApiComponent,
  | 'display'
  | 'edges'
  | 'id'
  | 'inComponent'
  | 'name'
  | 'techId'
  | 'type'
  | 'typeId'
>;

export interface NodeData {
  name: string;
  type: ApiComponent['type'];
  techId: ApiComponent['techId'];
  originalSize: ComponentForFlow['display']['size'];
  typeId: ApiComponent['typeId'];
}

export interface EdgeData {
  read: boolean;
  write: boolean;
}

export type ComputedNode = Node<NodeData>;
export type ComputedEdge = Edge<EdgeData>;
export interface ComputedFlow {
  nodes: ComputedNode[];
  edges: ComputedEdge[];
}

export type ProjectRelation = {
  from: { read: boolean; write: boolean };
  to: { read: boolean; write: boolean };
};

export type ProjectRelations = Record<
  string,
  Record<string, ProjectRelation['to']>
>;

export type OrgFlowUpdates = {
  edges: Record<
    string,
    {
      sourceHandle: FlowEdge['portSource'];
      targetHandle: FlowEdge['portTarget'];
    }
  >;
  nodes: Record<string, { display: FlowItemDisplay }>;
};
