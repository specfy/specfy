import type { Users } from '@prisma/client';

import type { Pagination, Res } from '../../types/api/api.js';

export type ApiUser = Pick<Users, 'avatarUrl' | 'email' | 'id' | 'name'>;

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
