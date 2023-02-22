import type { DBDocument } from '../db/documents';

import type { Pagination } from './api';
import type { ApiUser } from './me';

export type ApiDocument = DBDocument & {
  authors: ApiUser[];
  reviewers: ApiUser[];
  approvedBy: string[];
};

// GET /
export interface ReqListDocuments {
  org_id: string;
  project_id: string;
  search?: string;
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
