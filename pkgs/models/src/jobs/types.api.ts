import type { Pagination, Res } from '@specfy/core';
import type { Jobs } from '@specfy/db';

import type { ApiUser } from '../users/types.api.js';

import type { JobReason } from './types.js';

export type ApiJob = Pick<
  Jobs,
  'config' | 'id' | 'orgId' | 'projectId' | 'status' | 'type' | 'typeId'
> & {
  reason: JobReason | null; // Frontend bug without this
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  // logs: string | null;
  user: ApiUser;
};

// ------ GET /
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

// ------ GET /:job_id
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
