import type { Projects } from '@specfy/db';
import type { FlowItemDisplay, ComponentForFlow, ComputedEdge, ComputedFlow, ComputedNode, EdgeData } from './types.js';
export declare function createNodeFromProject(project: Pick<Projects, 'id' | 'name'>, display: FlowItemDisplay): ComputedNode;
export declare function createNode(component: Omit<ComponentForFlow, 'edges'>): ComputedNode;
export declare function getEdgeMarkers(data: EdgeData): Partial<ComputedEdge>;
export declare function componentsToFlow(components: ComponentForFlow[]): ComputedFlow;
