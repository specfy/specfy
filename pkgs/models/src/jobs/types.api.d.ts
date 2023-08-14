import type { Pagination, Res } from '@specfy/core';
import type { Jobs } from '@specfy/db';
import type { ApiUser } from '../users/types.api.js';
import type { JobReason } from './types.js';
export type ApiJob = Pick<Jobs, 'config' | 'id' | 'orgId' | 'projectId' | 'status' | 'type' | 'typeId'> & {
    reason: JobReason | null;
    createdAt: string;
    updatedAt: string;
    startedAt: string | null;
    finishedAt: string | null;
    user: ApiUser;
};
export type ListJobs = Res<{
    Querystring: {
        org_id: string;
        project_id: string;
    };
    Success: {
        data: ApiJob[];
        pagination: Pagination;
    };
}>;
export type GetJob = Res<{
    Querystring: {
        org_id: string;
        project_id: string;
    };
    Params: {
        job_id: string;
    };
    Success: {
        data: ApiJob;
    };
}>;
