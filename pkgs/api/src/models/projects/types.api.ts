import type { ConfigDocumentation, ConfigStack } from '@specfy/sync';

import type { Pagination, Res } from '../../types/api/api.js';

import type { DBProject } from './types.js';

export type ApiProject = DBProject;
export type ApiProjectList = Omit<
  ApiProject,
  'blobId' | 'config' | 'description' | 'links'
> & { users: number };
export interface ReqProjectParams {
  org_id: string;
  project_slug: string;
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
  Body: Pick<ApiProject, 'name' | 'orgId'> & {
    config?:
      | {
          documentation?: ConfigDocumentation | undefined;
          stack?: ConfigStack | undefined;
        }
      | undefined;
  };
  Success: { data: Pick<ApiProject, 'id' | 'slug'> };
}>;

// GET /:org_id/:project_slug
export type GetProject = Res<{
  Params: ReqProjectParams;
  Success: { data: ApiProject };
}>;

// POST /:org_id/:project_slug
export type PutProject = Res<{
  Params: ReqProjectParams;
  Body: Pick<ApiProject, 'name' | 'slug'>;
  Success: { data: ApiProject };
}>;

// DELETE /:org_id/:project_slug
export type DeleteProject = Res<{
  Params: ReqProjectParams;
  Success: never;
}>;
