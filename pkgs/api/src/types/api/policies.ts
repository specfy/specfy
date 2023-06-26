import type { DBPolicy } from '../db/policies.js';

import type { Pagination, Res } from './api.js';

export type ApiPolicy = DBPolicy;

// ------ GET /
export type ListPolicies = Res<{
  Querystring: {
    org_id: string;
  };
  Success: {
    data: ApiPolicy[];
    pagination: Pagination;
  };
}>;
