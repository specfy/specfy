import type { DBUser } from '../db/users';

import type { Pagination } from './api';

export type ApiUser = Pick<DBUser, 'email' | 'id' | 'name'>;

// ------ GET /
export type ReqListUsers = {
  org_id: string;
  project_id?: string;
  search?: string;
};
export type ResListUsers = {
  data: ApiUser[];
  pagination: Pagination;
};
