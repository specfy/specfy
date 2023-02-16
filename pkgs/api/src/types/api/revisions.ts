import type { DBRevision } from '../db/revisions';

export type ApiRevision = DBRevision;

// POST /
export type ReqPostRevision = Pick<
  ApiRevision,
  'changes' | 'description' | 'orgId' | 'parentId' | 'projectId' | 'title'
>;
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
