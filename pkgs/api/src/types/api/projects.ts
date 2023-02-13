import type { Pagination } from './api';
import type { BlockLevelZero } from './document';

export interface ApiProject {
  id: string;
  orgId: string;
  slug: string;
  name: string;
  description: BlockLevelZero;
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

// GET /:org_id/:project_slug
export interface ReqProjectParams {
  org_id: string;
  project_slug: string;
}

export interface ResGetProject {
  data: ApiProject;
}
