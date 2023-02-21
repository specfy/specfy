import type {
  DBBlobComponent,
  DBBlobDocument,
  DBBlobProject,
  DBBlobBase,
} from '../db/blobs';
import type { DBRevision } from '../db/revisions';

import type { Pagination } from './api';
import type { ApiUser } from './me';

export type ApiRevision = DBRevision & {
  authors: ApiUser[];
};

// GET /
export type ReqListRevisions = {
  org_id: string;
  project_id: string;
  status?: ApiRevision['status'] | 'all' | 'merged' | 'opened';
};
export type ResListRevisions = {
  data: ApiRevision[];
  pagination: Pagination;
};

// POST /
type ApiBlobCreate = Pick<DBBlobBase, 'deleted' | 'parentId' | 'typeId'> &
  (DBBlobComponent | DBBlobDocument | DBBlobProject);

export type ReqPostRevision = Pick<
  ApiRevision,
  'description' | 'orgId' | 'projectId' | 'title'
> & {
  blobs: ApiBlobCreate[];
};
export type ResPostRevision = Pick<ApiRevision, 'id'>;

// GET /:id
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

// POST /:id/merge
export interface ResMergeRevision {
  data: {
    done: true;
  };
}
