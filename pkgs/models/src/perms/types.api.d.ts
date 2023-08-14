import type { Res } from '@specfy/core';
import type { ApiUser } from '../users/types.api.js';
import type { DBPerm } from './types.js';
export type ApiPerm = Omit<DBPerm, 'userId'> & {
    user: ApiUser;
};
export type ListPerms = Res<{
    Querystring: {
        org_id: string;
        project_id?: string;
    };
    Success: {
        data: ApiPerm[];
    };
}>;
export type GetCountPerms = Res<{
    Querystring: ListPerms['Querystring'];
    Success: {
        data: number;
    };
}>;
export type PutPerm = Res<{
    Body: {
        org_id: string;
        project_id?: string;
        userId: string;
        role: ApiPerm['role'];
    };
    Success: {
        data: {
            done: boolean;
        };
    };
}>;
export type DeletePerm = Res<{
    Body: {
        org_id: string;
        project_id?: string;
        userId: string;
    };
    Success: never;
}>;
