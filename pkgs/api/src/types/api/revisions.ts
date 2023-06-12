import type {
  DBBlobBase,
  DBBlobComponentBase,
  DBBlobDocumentBase,
  DBBlobProjectBase,
} from '../db/blobs';
import type { DBRevision } from '../db/revisions';

import type { Pagination, ResErrors } from './api';
import type { BlockLevelZero } from './document';
import type { ApiReview } from './reviews';
import type { ApiUser } from './users';

export type ApiRevision = DBRevision & {
  authors: ApiUser[];
  url: string;
};

// ------ GET /
export type ReqListRevisions = {
  org_id: string;
  project_id: string;
  status?: ApiRevision['status'] | 'all' | 'merged' | 'opened';
  search?: string;
};
export type ResListRevisionsSuccess = {
  data: ApiRevision[];
  pagination: Pagination;
};
export type ResListRevisions = ResErrors | ResListRevisionsSuccess;

// ------ POST /
export type ApiBlobCreate = Omit<DBBlobBase, 'createdAt' | 'id' | 'updatedAt'> &
  (DBBlobComponentBase | DBBlobDocumentBase | DBBlobProjectBase);
export type ApiBlobCreateDocument = DBBlobDocumentBase &
  Omit<DBBlobBase, 'createdAt' | 'id' | 'updatedAt'>;

export type ReqPostRevision = Pick<
  ApiRevision,
  'description' | 'name' | 'orgId' | 'projectId'
> & {
  blobs: ApiBlobCreate[];
};
export type ResPostRevisionSuccess = Pick<ApiRevision, 'id'>;
export type ResPostRevision = ResErrors | ResPostRevisionSuccess;

// ------ POST /upload
export type ReqPostUploadRevision = Pick<
  ApiRevision,
  'description' | 'name' | 'orgId' | 'projectId'
> & {
  source: string;
  blobs: Array<{ path: string; content: string }>;
};
export type ResPostUploadRevisionSuccess = Pick<ApiRevision, 'id'>;
export type ResPostUploadRevision = ResErrors | ResPostUploadRevisionSuccess;

// ------ GET /:id
export interface ReqRevisionParams {
  revision_id: string;
}
export interface ReqGetRevision {
  org_id: string;
  project_id: string;
}

export interface ResGetRevisionSuccess {
  data: ApiRevision & {
    reviewers: ApiUser[];
  };
}
export type ResGetRevision = ResErrors | ResGetRevisionSuccess;

// ------ POST /:id
export type ReqPatchRevision = Partial<
  Pick<
    ResGetRevisionSuccess['data'],
    'description' | 'locked' | 'name' | 'status'
  > & {
    authors: string[];
    reviewers: string[];
  }
>;
export interface ResPatchRevisionSuccess {
  data: { done: boolean };
}
export type ResPatchRevision = ResErrors | ResPatchRevisionSuccess;

// ------ POST /:id/merge
export interface ResMergeRevisionSuccess {
  data: {
    done: true;
  };
}
export interface ResMergeRevisionError {
  error: {
    code: 'cant_merge';
    reason: 'already_merged' | 'empty' | 'no_reviews' | 'outdated';
  };
}
export type ResMergeRevision =
  | ResErrors
  | ResMergeRevisionError
  | ResMergeRevisionSuccess;

// ------ POST /:id/comment
export interface ReqPostCommentRevision {
  content: BlockLevelZero;
  approval: boolean;
}
export interface ResPostCommentRevisionSuccess {
  data: {
    id: string;
  };
}
export type ResPostCommentRevision = ResErrors | ResPostCommentRevisionSuccess;

// ------ POST /:id/checks
export interface ResCheckRevisionSuccess {
  data: {
    canMerge: boolean;
    reviews: ApiReview[];
    outdatedBlobs: string[];
  };
}
export type ResCheckRevision = ResCheckRevisionSuccess | ResErrors;

// ------ POST /:id/rebase
export interface ResRebaseRevisionSuccess {
  data: {
    done: boolean;
  };
}
export type ResRebaseRevision = ResErrors | ResRebaseRevisionSuccess;

// ------ DELETE /:id
export type ResDeleteRevision = ResErrors | never;
