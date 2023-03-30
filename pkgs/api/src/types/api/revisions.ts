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
export type ApiBlobCreate = Omit<
  DBBlobBase,
  'createdAt' | 'id' | 'orgId' | 'projectId' | 'updatedAt'
> &
  (DBBlobComponentBase | DBBlobDocumentBase | DBBlobProjectBase);

export type ReqPostRevision = Pick<
  ApiRevision,
  'description' | 'name' | 'orgId' | 'projectId'
> & {
  blobs: ApiBlobCreate[];
};
export type ResPostRevision = Pick<ApiRevision, 'id'> | ResErrors;

// ------ GET /:id
export interface ReqRevisionParams {
  revision_id: string;
}
export interface ReqGetRevision {
  org_id: string;
  project_id: string;
}

export interface ResGetRevision {
  data: ApiRevision & {
    reviewers: ApiUser[];
  };
}

// ------ POST /:id
export type ReqPutRevision = Pick<
  ResGetRevision['data'],
  'blobs' | 'description' | 'locked' | 'name' | 'status'
> & { authors: string[]; reviewers: string[] };
export interface ResPutRevisionSuccess {
  data: { done: boolean };
}
export type ResPutRevision = ResErrors | ResPutRevisionSuccess;

// ------ POST /:id/merge
export interface ResMergeRevisionSuccess {
  data: {
    done: true;
  };
}
export interface ResMergeRevisionError {
  cantMerge: string;
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
export interface ResPostCommentRevision {
  data: {
    id: number;
  };
}

// ------ POST /:id/checks
export interface ResCheckRevision {
  data: {
    canMerge: boolean;
    reviews: ApiReview[];
    outdatedBlobs: string[];
  };
}

// ------ POST /:id/rebase
export interface ResRebaseRevisionSuccess {
  data: {
    done: boolean;
  };
}
export type ResRebaseRevision = ResErrors | ResRebaseRevisionSuccess;

// ------ DELETE /:id
export type ResDeleteRevision = ResErrors | never;
