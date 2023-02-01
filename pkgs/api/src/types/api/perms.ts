import type { DBPerm } from '../db/perms';

import type { ApiUser } from './me';

export interface ApiPerm {
  id: string;
  orgId: string;
  projectId: string | null;
  user: ApiUser;
  role: DBPerm['role'];
  createdAt: string;
  updatedAt: string;
}

// GET /:org_id
export interface ReqListPerms {
  org_id: string;
  project_id?: string;
}

export interface ResListPerms {
  data: ApiPerm[];
}
