import type { QuerystringOrgMaybeProject, Res } from '../../types/api/api.js';

import type { ComputedFlow, OrgFlowUpdates } from './types.js';

export interface ApiFlow {
  id: string;

  flow: ComputedFlow;

  createdAt: string;
  updatedAt: string;
}

// GET /:id
export type GetFlow = Res<{
  Params: {
    flow_id: string;
  };
  Querystring: QuerystringOrgMaybeProject;
  Success: {
    data: ApiFlow;
  };
}>;

// PATCH /:id
export type PatchFlow = Res<{
  Params: {
    flow_id: string;
  };
  Body: {
    updates: OrgFlowUpdates;
  };
  Querystring: QuerystringOrgMaybeProject;
  Success: {
    data: {
      done: true;
    };
  };
}>;
