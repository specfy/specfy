import type { Pagination, Res } from '@specfy/core';
import type { DBPolicy } from './types.js';
export type ApiPolicy = DBPolicy;
export type ListPolicies = Res<{
    Querystring: {
        org_id: string;
    };
    Success: {
        data: ApiPolicy[];
        pagination: Pagination;
    };
}>;
