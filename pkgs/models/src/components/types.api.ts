import type { Pagination, QuerystringOrgProject, Res } from '@specfy/core';

import type { DBComponent } from './types.js';

export type ApiComponent = DBComponent;

// GET /
export type ListComponents = Res<{
  Querystring: QuerystringOrgProject;
  Success: {
    data: ApiComponent[];
    pagination: Pagination;
  };
}>;
