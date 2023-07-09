import type { FlowEdge, FlowItemDisplay } from '../../types/db/index.js';

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
