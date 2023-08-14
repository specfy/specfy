import type { Pagination, Res } from '@specfy/core';
import type { Users } from '@specfy/db';
export type ApiUser = Pick<Users, 'avatarUrl' | 'email' | 'id' | 'name'>;
export type ApiUserPublic = Pick<Users, 'avatarUrl' | 'githubLogin' | 'id' | 'name'>;
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
export type GetUser = Res<{
    Params: {
        user_id: string;
    };
    Success: {
        data: ApiUserPublic;
    };
}>;
