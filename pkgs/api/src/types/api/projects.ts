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

// GET /:slug
export interface ReqProjectParams {
  slug: string;
}
export interface ReqGetProject {
  org_id: string;
}

export interface ResGetProject {
  data: ApiProject;
}
