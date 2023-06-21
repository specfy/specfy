import type { DBPolicy } from '../db/policies';

import type { Pagination, Res } from './api';

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
