import type {
  DBBlobComponent,
  DBBlobDocument,
  DBBlobProject,
  DBBlobBase,
} from '../db/blobs';
import type { DBRevision } from '../db/revisions';

import type { Pagination } from './api';

export type ApiRevision = DBRevision;

// GET /
export type ReqListRevisions = {
  org_id: string;
  project_id: string;
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
export interface ReqGetRevision {
  id: string;
  org_id: string;
  project_id: string;
}

export interface ResGetRevision {
  data: ApiRevision;
}
