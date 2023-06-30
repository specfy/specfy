import type { Edge, Node } from 'reactflow';

import type { ApiComponent } from '../../types/api/index.js';

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
  'display' | 'edges' | 'id' | 'inComponent' | 'name' | 'techId' | 'type'
>;

export interface NodeData {
  label: string;
  type: ApiComponent['type'];
  techId: ApiComponent['techId'];
  originalSize: ComponentForFlow['display']['size'];
}
export interface EdgeData {
  read: boolean;
  write: boolean;
}

export interface ComputedFlow {
  edges: Array<Edge<EdgeData>>;
  nodes: Array<Node<NodeData>>;
}
