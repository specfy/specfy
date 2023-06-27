import type { Pagination, Res } from './api.js';

export type ApiKey = { key: string; createdAt: string };

// GET /
export type ListKeys = Res<{
  Querystring: {
    org_id: string;
    project_id: string;
  };
  Success: {
    data: ApiKey[];
    pagination: Pagination;
  };
}>;
