import type { Pagination, Res } from '../../types/api/api.js';

import type { DBPolicy } from './types.js';

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
