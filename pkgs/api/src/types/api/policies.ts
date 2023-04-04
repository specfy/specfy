import type { DBPolicy } from '../db/policies';

import type { Pagination, ResErrors } from './api';

export type ApiPolicy = DBPolicy;

// ------ GET /
export type ReqListPolicies = {
  org_id: string;
};
export type ResListPolicies =
  | ResErrors
  | {
      data: ApiPolicy[];
      pagination: Pagination;
    };
