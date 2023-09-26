import type { Pagination, QuerystringOrgProject, Res } from '@specfy/core';

import type { DBDocument } from './types.js';
import type { ApiUser } from '../users/types.api.js';

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
    project_id?: string | undefined;
    search?: string | undefined;
    type?: ApiDocument['type'] | undefined;
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

// GET /by_slug
export type GetDocumentBySlug = Res<{
  Querystring: QuerystringOrgProject & { slug: string };
  Success: {
    data: ApiDocument;
  };
}>;
