import type { DBPerm } from '../db/perms';

import type { ResErrors } from './api';
import type { ApiUser } from './users';

export type ApiPerm = Omit<DBPerm, 'userId'> & { user: ApiUser };

// GET /
export interface ReqListPerms {
  org_id: string;
  project_id?: string;
}

export interface ResListPerms {
  data: ApiPerm[];
}

// POST /
export interface ReqPostPerms {
  org_id: string;
  project_id: string;
  userId: string;
  role: ApiPerm['role'];
}

export interface ResPostPerms {
  data: { done: boolean };
}

// DELETE /
export interface ReqDeletePerms {
  org_id: string;
  project_id?: string;
  userId: string;
}

export type ResDeletePerms = ResErrors | unknown;
