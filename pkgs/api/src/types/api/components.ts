import type { DBComponent } from '../db/components';

import type { Pagination } from './api';

export type ApiComponent = DBComponent;

// GET /
export interface ReqListComponents {
  org_id: string;
  project_id: string;
}

export interface ResListComponents {
  data: ApiComponent[];
  pagination: Pagination;
}
