import type { Pagination } from './api';

export interface ApiProject {
  id: string;
  orgId: string;
  slug: string;
  name: string;
  description: string;
  links: Array<{ title: string; link: string }>;
  owners: string[];
  reviewers: string[];
  contributors: string[];
  createdAt: string;
  updatedAt: string;
}

// GET /
export interface ReqListProjects {
  org_id: string;
}

export interface ResListProjects {
  data: ApiProject[];
  pagination: Pagination;
}

// POST /
export type ReqPostProject = Pick<ApiProject, 'description' | 'name' | 'orgId'>;
export type ResPostProject = Pick<ApiProject, 'id' | 'slug'>;

// GET /:orgId/:slug
export interface ReqProjectParams {
  orgId: string;
  slug: string;
}

export interface ResGetProject {
  data: ApiProject;
}
