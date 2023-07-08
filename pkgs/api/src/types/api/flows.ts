import type { ComputedFlow } from '../../common/flow/types.js';

import type { QuerystringOrgMaybeProject, Res } from './api.js';

export interface ApiFlow {
  id: string;

  flow: ComputedFlow;

  createdAt: string;
  updatedAt: string;
}

// GET /:id
export type GetFlow = Res<{
  Querystring: QuerystringOrgMaybeProject;
  Success: {
    data: ApiFlow;
  };
}>;
