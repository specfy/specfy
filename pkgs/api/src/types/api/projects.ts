import type { DBProject } from '../db/projects';

import type { Pagination, ResValidationError } from './api';

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
export type ReqPostProject = Pick<ApiProject, 'name' | 'orgId' | 'slug'> & {
  display: { pos: Pick<ApiProject['display']['pos'], 'x' | 'y'> };
};
export type ResPostProject =
  | Pick<ApiProject, 'id' | 'slug'>
  | ResValidationError;

// GET /:org_id/:project_slug
export interface ReqProjectParams {
  org_id: string;
  project_slug: string;
}

export interface ResGetProject {
  data: ApiProject;
}

// POST /:org_id/:project_slug
export type ReqUpdateProject = Pick<ApiProject, 'name'>;
export type ResUpdateProject = ResGetProject;
