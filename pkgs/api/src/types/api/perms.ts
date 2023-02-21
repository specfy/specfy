import type { DBPerm } from '../db/perms';

import type { ApiUser } from './me';

export type ApiPerm = Omit<DBPerm, 'userId'> & { user: ApiUser };

// GET /:org_id
export interface ReqListPerms {
  org_id: string;
  project_id?: string;
}

export interface ResListPerms {
  data: ApiPerm[];
}
