import type { DBComponent } from '../db/components.js';

import type { Pagination, QuerystringOrgProject, Res } from './api.js';

export type ApiComponent = DBComponent;

// GET /
export type ListComponents = Res<{
  Querystring: QuerystringOrgProject;
  Success: {
    data: ApiComponent[];
    pagination: Pagination;
  };
}>;
