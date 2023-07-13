import type { Jobs } from '@prisma/client';

import type { Pagination, Res } from '../../types/api/api.js';
import type { ApiUser } from '../../types/api/users.js';

import type { JobReason } from './type.js';

export type ApiJob = Pick<
  Jobs,
  'config' | 'id' | 'status' | 'type' | 'typeId'
> & {
  reason: JobReason | null; // Frontend bug without this
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
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
