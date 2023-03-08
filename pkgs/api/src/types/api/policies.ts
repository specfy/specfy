import type { DBPolicy } from '../db/policies';

import type { Pagination } from './api';

export type ApiPolicy = DBPolicy;

// ------ GET /
export type ReqListPolicies = {
  org_id: string;
};
export type ResListPolicies = {
  data: ApiPolicy[];
  pagination: Pagination;
};
