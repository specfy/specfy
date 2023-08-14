import type { Edge, Node } from 'reactflow';
import type { ApiComponent } from '../components';
export interface LayoutNode {
    id: string;
    pos: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
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
export type ComponentForFlow = Pick<ApiComponent, 'display' | 'edges' | 'id' | 'inComponent' | 'name' | 'techId' | 'type' | 'typeId'>;
export interface NodeData {
    name: string;
    type: ApiComponent['type'];
    techId: ApiComponent['techId'];
    originalSize: ComponentForFlow['display']['size'];
    typeId: ApiComponent['typeId'];
    moving?: boolean | 'source' | 'target';
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
    from: {
        read: boolean;
        write: boolean;
    };
    to: {
        read: boolean;
        write: boolean;
    };
};
export type ProjectRelations = Record<string, Record<string, ProjectRelation['to']>>;
export type OrgFlowUpdates = {
    edges: Record<string, {
        sourceHandle: FlowEdge['portSource'];
        targetHandle: FlowEdge['portTarget'];
    }>;
    nodes: Record<string, {
        display: FlowItemDisplay;
    }>;
};
export interface FlowItemDisplay {
    zIndex?: number | undefined;
    color?: string;
    backgroundColor?: string;
    pos: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
}
export interface FlowEdge {
    target: string;
    read: boolean;
    write: boolean;
    vertices: Array<{
        x: number;
        y: number;
    }>;
    portSource: 'sb' | 'sl' | 'sr' | 'st';
    portTarget: 'tb' | 'tl' | 'tr' | 'tt';
}
