import type { DBProject } from '../db/projects';

import type { Pagination, ResErrors } from './api';

export type ApiProject = DBProject;

// GET /
export interface ReqListProjects {
  org_id: string;
}
export interface ResListProjectsSuccess {
  data: ApiProject[];
  pagination: Pagination;
}
export type ResListProjects = ResErrors | ResListProjectsSuccess;

// POST /
export type ReqPostProject = Pick<ApiProject, 'name' | 'orgId' | 'slug'> & {
  display: { pos: Pick<ApiProject['display']['pos'], 'x' | 'y'> };
};
export type ResPostProjectSuccess = Pick<ApiProject, 'id' | 'slug'>;
export type ResPostProject = ResErrors | ResPostProjectSuccess;

// GET /:org_id/:project_slug
export interface ReqProjectParams {
  org_id: string;
  project_slug: string;
}

export interface ResGetProjectSuccess {
  data: ApiProject;
}
export type ResGetProject = ResErrors | ResGetProjectSuccess;

// POST /:org_id/:project_slug
export type ReqPutProject = Pick<ApiProject, 'name'>;
export type ResPutProjectSuccess = { data: ApiProject };
export type ResPutProject = ResErrors | ResPutProjectSuccess;

// DELETE /:org_id/:project_slug
export type ResDeleteProject = ResErrors | never;
