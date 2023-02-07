import type { Pagination } from './api';
import type { BlockLevelOne } from './document';
import type { ApiUser } from './me';

export interface ApiDocument {
  id: string;
  orgId: string;
  projectId: string;
  type: 'rfc';
  typeId: number;
  name: string;
  slug: string;
  create: string[];
  update: string[];
  use: string[];
  remove: string[];
  tldr: string;
  blocks: BlockLevelOne[];
  authors: ApiUser[];
  reviewers: ApiUser[];
  approvedBy: string[];
  status: 'approved' | 'draft' | 'rejected';
  locked: boolean;
  createdAt: string;
  updatedAt: string;
}

// GET /
export interface ReqListDocuments {
  org_id: string;
  project_id: string;
}

export interface ResListDocuments {
  data: ApiDocument[];
  pagination: Pagination;
}

// GET /:id
export interface ReqDocumentParams {
  type: string;
  type_id: string;
}
export interface ReqGetDocument {
  org_id: string;
}

export interface ResGetDocument {
  data: ApiDocument;
}
