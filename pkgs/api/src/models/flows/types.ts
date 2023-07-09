import type { FlowEdge, FlowItemDisplay } from '../../types/db/index.js';

export type ProjectRelation = {
  from: { read: boolean; write: boolean };
  to: { read: boolean; write: boolean };
};

export type OrgFlowUpdates = {
  edges: Record<string, Pick<FlowEdge, 'portSource'>>;
  nodes: Record<string, { display: FlowItemDisplay }>;
};
