import type { DBUser } from '../db/users';

import type { Pagination, Res } from './api';

export type ApiUser = Pick<DBUser, 'avatarUrl' | 'email' | 'id' | 'name'>;

// ------ GET /
export type ListUsers = Res<{
  Querystring: {
    org_id: string;
    project_id?: string;
    search?: string;
  };
  Success: {
    data: ApiUser[];
    pagination: Pagination;
  };
}>;
