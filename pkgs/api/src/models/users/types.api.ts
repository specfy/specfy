import type { Users } from '@specfy/db';

import type { Pagination, Res } from '../../types/api/api.js';

export type ApiUser = Pick<Users, 'avatarUrl' | 'email' | 'id' | 'name'>;
export type ApiUserPublic = Pick<
  Users,
  'avatarUrl' | 'githubLogin' | 'id' | 'name'
>;

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

// ------ GET /
export type GetUser = Res<{
  Params: {
    user_id: string;
  };
  Success: {
    data: ApiUserPublic;
  };
}>;
