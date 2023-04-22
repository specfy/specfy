import type { DBPerm } from '../db/perms';

import type { ResErrors } from './api';
import type { ApiUser } from './users';

export type ApiPerm = Omit<DBPerm, 'userId'> & { user: ApiUser };

// GET /
export interface ReqListPerms {
  org_id: string;
  project_id?: string;
}

export interface ResListPermsSuccess {
  data: ApiPerm[];
}
export type ResListPerms = ResErrors | ResListPermsSuccess;

// GET /count
export interface ResCountPermsSuccess {
  data: number;
}
export type ResCountPerms = ResCountPermsSuccess | ResErrors;

// POST /
export interface ReqPutPerms {
  org_id: string;
  project_id?: string;
  userId: string;
  role: ApiPerm['role'];
}
export interface ResPutPermsSuccess {
  data: { done: boolean };
}
export type ResPutPerms = ResErrors | ResPutPermsSuccess;

// DELETE /
export interface ReqDeletePerms {
  org_id: string;
  project_id?: string;
  userId: string;
}
export type ResDeletePermsSuccess = never;
export type ResDeletePerms = ResDeletePermsSuccess | ResErrors;
