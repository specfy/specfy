import type {
  Pagination,
  QuerystringOrgProject,
  Res,
  PartialUndefined,
} from '@specfy/core';
import type { AnalyserJson } from '@specfy/stack-analyser';

import type { DocsToBlobs } from './helpers.upload.js';
import type { DBRevision } from './types.js';
import type {
  DBBlobBase,
  DBBlobComponentBase,
  DBBlobDocumentBase,
  DBBlobProjectBase,
} from '../blobs/types.js';
import type { BlockLevelZero } from '../documents/types.prosemirror.js';
import type { ApiReview } from '../reviews/types.api.js';
import type { StackToBlobs } from '../stack/types.js';
import type { ApiUser } from '../users/types.api.js';

type ApiRevisionBase = { authors: ApiUser[]; url: string };
export type ApiRevisionList = Omit<DBRevision, 'stack' | 'description'> &
  ApiRevisionBase;
export type ApiRevision = DBRevision & ApiRevisionBase;

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
    data: ApiRevisionList[];
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
export type ApiBlobCreateProject = DBBlobProjectBase &
  Omit<DBBlobBase, 'createdAt' | 'id' | 'updatedAt'>;

export type PostRevision = Res<{
  Body: Pick<ApiRevision, 'description' | 'name' | 'orgId' | 'projectId'> & {
    blobs: ApiBlobCreate[];
    draft: boolean;
  };
  Success: { data: Pick<ApiRevision, 'id'> };
}>;

// ------ POST /upload
export type CreateRevisionError = {
  error: {
    code: 'cant_create';
    reason: 'no_diff';
  };
};
export type UploadBlob = { path: string; content: string };
export type PostUploadRevision = Res<{
  Body: Pick<ApiRevision, 'description' | 'name' | 'orgId' | 'projectId'> & {
    source: string;
    blobs: UploadBlob[] | null;
    stack: AnalyserJson | null;
    autoLayout?: boolean;
    jobId?: string | undefined;
  };
  Error: CreateRevisionError;
  Success: {
    data: Pick<ApiRevision, 'id'> & {
      stats: {
        stack: StackToBlobs['stats'] | undefined;
        docs: DocsToBlobs['stats'] | undefined;
      };
    };
  };
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
  Error: MergeRevisionError;
  Success: {
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
