import type { DBPolicy } from '../db/policies';

import type { Pagination, ResErrors } from './api';

export type ApiPolicy = DBPolicy;

// ------ GET /
export type ReqListPolicies = {
  org_id: string;
};
export interface ResListPoliciesSuccess {
  data: ApiPolicy[];
  pagination: Pagination;
}
export type ResListPolicies = ResErrors | ResListPoliciesSuccess;
