import type {
  DBBlobBase,
  DBBlobComponentBase,
  DBBlobDocumentBase,
  DBBlobProjectBase,
} from '../db/blobs';
import type { DBRevision } from '../db/revisions';

import type { Pagination } from './api';
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
export type ResListRevisions = {
  data: ApiRevision[];
  pagination: Pagination;
};

// ------ POST /
type ApiBlobCreate = Omit<
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
export type ResPostRevision = Pick<ApiRevision, 'id'>;

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
export interface ResPutRevision {
  data: { done: boolean };
}

// ------ POST /:id/merge
export interface ResMergeRevision {
  data: {
    done: true;
  };
}
export interface ResMergeRevisionError {
  cantMerge: string;
}

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
export interface ResRebaseRevision {
  data: {
    done: boolean;
  };
}
