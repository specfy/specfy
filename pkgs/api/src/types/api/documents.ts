import type { DBDocument } from '../db/documents.js';

import type { Pagination, QuerystringOrgProject, Res } from './api.js';
import type { ApiUser } from './users.js';

export type ApiDocument = DBDocument & {
  authors: ApiUser[];
  reviewers: ApiUser[];
  approvedBy: string[];
};

// GET /
export type DocumentSimple = Pick<
  ApiDocument,
  | 'createdAt'
  | 'id'
  | 'name'
  | 'parentId'
  | 'slug'
  | 'tldr'
  | 'type'
  | 'typeId'
  | 'updatedAt'
>;
export type ListDocuments = Res<{
  Querystring: {
    org_id: string;
    project_id: string;
    search?: string;
    type?: ApiDocument['type'];
  };
  Success: {
    data: DocumentSimple[];
    pagination: Pagination;
  };
}>;

// GET /:id
export type GetDocument = Res<{
  Params: {
    document_id: ApiDocument['id'];
  };
  Querystring: QuerystringOrgProject;
  Success: {
    data: ApiDocument;
  };
}>;
