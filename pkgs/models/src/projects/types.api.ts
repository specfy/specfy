import type { Pagination, Res } from '@specfy/core';

import type { DBProject } from './types.js';

export type ApiProject = DBProject;
export type ApiProjectList = Omit<
  ApiProject,
  'blobId' | 'config' | 'description' | 'links'
> & { users: number };
export interface ReqProjectParams {
  project_id: string;
}
export interface ReqProjectQuery {
  org_id: string;
}

// GET /
export type ListProjects = Res<{
  Querystring: {
    org_id: string;
  };
  Success: {
    data: ApiProjectList[];
    pagination: Pagination;
  };
}>;

// POST /
export type PostProject = Res<{
  Body: Pick<ApiProject, 'name' | 'orgId'>;
  Success: { data: Pick<ApiProject, 'id' | 'slug'> };
}>;

// GET /:project_id
export type GetProject = Res<{
  Params: ReqProjectParams;
  Querystring: ReqProjectQuery;
  Success: { data: ApiProject };
}>;
// GET /by_slug
export type GetProjectBySlug = Res<{
  Querystring: ReqProjectQuery & { slug: string };
  Success: { data: ApiProject };
}>;

// POST /:project_id
export type PutProject = Res<{
  Params: ReqProjectParams;
  Querystring: ReqProjectQuery;
  Body: {
    name?: string | undefined;
    slug?: string | undefined;
    config?: ApiProject['config'] | undefined;
  };
  Success: { data: ApiProject };
}>;

// DELETE /:project_id
export type DeleteProject = Res<{
  Params: ReqProjectParams;
  Querystring: ReqProjectQuery;
  Success: never;
}>;
