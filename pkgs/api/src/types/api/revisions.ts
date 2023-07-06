import type { AnalyserJson } from '@specfy/stack-analyser';

import type {
  DBBlobBase,
  DBBlobComponentBase,
  DBBlobDocumentBase,
  DBBlobProjectBase,
} from '../db/blobs.js';
import type { DBRevision } from '../db/revisions.js';
import type { PartialUndefined } from '../utils.js';

import type { Pagination, QuerystringOrgProject, Res } from './api.js';
import type { BlockLevelZero } from './document.js';
import type { ApiReview } from './reviews.js';
import type { ApiUser } from './users.js';

export type ApiRevision = DBRevision & {
  authors: ApiUser[];
  url: string;
};
export interface ParamsRevision {
  revision_id: string;
}

// ------ GET /
export type ListRevisions = Res<{
  Querystring: {
    org_id: string;
    project_id: string;
    status?: ApiRevision['status'] | 'all' | 'merged' | 'opened';
    search?: string;
  };
  Success: {
    data: ApiRevision[];
    pagination: Pagination;
  };
}>;

// ------ POST /
export type ApiBlobCreate = Omit<DBBlobBase, 'createdAt' | 'id' | 'updatedAt'> &
  (DBBlobComponentBase | DBBlobDocumentBase | DBBlobProjectBase);
export type ApiBlobCreateDocument = DBBlobDocumentBase &
  Omit<DBBlobBase, 'createdAt' | 'id' | 'updatedAt'>;
export type ApiBlobCreateComponent = DBBlobComponentBase &
  Omit<DBBlobBase, 'createdAt' | 'id' | 'updatedAt'>;

export type PostRevision = Res<{
  Body: Pick<ApiRevision, 'description' | 'name' | 'orgId' | 'projectId'> & {
    blobs: ApiBlobCreate[];
    draft: boolean;
  };
  Success: Pick<ApiRevision, 'id'>;
}>;

// ------ POST /upload
export type CreateRevisionError = {
  error: {
    code: 'cant_create';
    reason: 'no_diff';
  };
};
export type PostUploadRevision = Res<{
  Body: Pick<ApiRevision, 'description' | 'name' | 'orgId' | 'projectId'> & {
    source: string;
    blobs: Array<{ path: string; content: string }>;
    stack: AnalyserJson | null;
  };
  Success: CreateRevisionError | Pick<ApiRevision, 'id'>;
}>;

// ------ GET /:id
export type GetRevision = Res<{
  Params: ParamsRevision;
  Querystring: QuerystringOrgProject;
  Success: {
    data: ApiRevision & {
      reviewers: ApiUser[];
    };
  };
}>;

// ------ POST /:id
export type PatchRevision = Res<{
  Params: ParamsRevision;
  Querystring: QuerystringOrgProject;
  Body: PartialUndefined<
    Pick<
      GetRevision['Success']['data'],
      'description' | 'locked' | 'name' | 'status'
    > & {
      authors: string[];
      reviewers: string[];
    }
  >;
  Success: { data: { done: boolean } };
}>;

// ------ POST /:id/merge
export type MergeRevisionError = {
  error: {
    code: 'cant_merge';
    reason: 'already_merged' | 'empty' | 'no_reviews' | 'outdated';
  };
};
export type MergeRevision = Res<{
  Params: ParamsRevision;
  Querystring: QuerystringOrgProject;
  Success:
    | MergeRevisionError
    | {
        data: {
          done: true;
        };
      };
}>;

// ------ POST /:id/comment
export type CommentRevision = Res<{
  Params: ParamsRevision;
  Querystring: QuerystringOrgProject;
  Body: {
    content: BlockLevelZero;
    approval: boolean;
  };
  Success: {
    data: {
      id: string;
    };
  };
}>;

// ------ POST /:id/checks
export type ListRevisionChecks = Res<{
  Params: ParamsRevision;
  Querystring: QuerystringOrgProject;
  Success: {
    data: {
      canMerge: boolean;
      reviews: ApiReview[];
      outdatedBlobs: string[];
    };
  };
}>;

// ------ POST /:id/rebase
export type RebaseRevision = Res<{
  Params: ParamsRevision;
  Querystring: QuerystringOrgProject;
  Success: {
    data: {
      done: boolean;
    };
  };
}>;

// ------ DELETE /:id
export type DeleteRevision = Res<{
  Params: ParamsRevision;
  Querystring: QuerystringOrgProject;
  Success: never;
}>;
