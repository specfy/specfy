import type { DBDocument } from '../db/documents';

import type { Pagination, ResErrors } from './api';
import type { ApiUser } from './users';

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
  type?: ApiDocument['type'];
}
export type DocumentSimple = Pick<
  ApiDocument,
  | 'createdAt'
  | 'id'
  | 'name'
  | 'slug'
  | 'tldr'
  | 'type'
  | 'typeId'
  | 'updatedAt'
>;

export interface ResListDocumentsSuccess {
  data: DocumentSimple[];
  pagination: Pagination;
}
export type ResListDocuments = ResErrors | ResListDocumentsSuccess;

// GET /:id
export interface ReqDocumentParams {
  document_id: ApiDocument['id'];
}
export interface ReqGetDocument {
  org_id: string;
  project_id: string;
}

export interface ResGetDocumentSuccess {
  data: ApiDocument;
}
export type ResGetDocument = ResErrors | ResGetDocumentSuccess;
