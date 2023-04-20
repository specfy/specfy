import type { DBComponent } from '../db/components';

import type { Pagination, ResErrors } from './api';

export type ApiComponent = DBComponent;

// GET /
export interface ReqListComponents {
  org_id: string;
  project_id: string;
}

export interface ResListComponentsSuccess {
  data: ApiComponent[];
  pagination: Pagination;
}

export type ResListComponents = ResErrors | ResListComponentsSuccess;
