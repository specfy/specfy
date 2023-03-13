import type { DBProject } from '../db/projects';

import type { Pagination } from './api';

export type ApiProject = DBProject;

// GET /
export interface ReqListProjects {
  org_id: string;
}

export interface ResListProjects {
  data: ApiProject[];
  pagination: Pagination;
}

// POST /
export type ReqPostProject = Pick<ApiProject, 'name' | 'orgId'>;
export type ResPostProject = Pick<ApiProject, 'id' | 'slug'>;

// GET /:org_id/:project_slug
export interface ReqProjectParams {
  org_id: string;
  project_slug: string;
}

export interface ResGetProject {
  data: ApiProject;
}
