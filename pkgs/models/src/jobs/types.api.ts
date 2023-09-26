import type { Pagination, Res } from '@specfy/core';
import type { Jobs } from '@specfy/db';

import type { JobReason } from './types.js';
import type { ApiUser } from '../users/types.api.js';

type ApiJobBase = Pick<
  Jobs,
  'config' | 'id' | 'orgId' | 'projectId' | 'status' | 'type' | 'typeId'
> & {
  reason: JobReason | null; // Frontend bug without this
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  user: ApiUser;
};
export type ApiJobList = ApiJobBase;
export type ApiJob = ApiJobBase & {
  logs: string;
  revisionId: string | null;
};

// ------ GET /
export type ListJobs = Res<{
  Querystring: { org_id: string; project_id: string };
  Success: { data: ApiJobList[]; pagination: Pagination };
}>;

// ------ POST /
export type CreateJobError = {
  error: {
    code: 'failed_to_create_job';
    reason: 'no_project' | 'no_project_repository' | 'server_error';
  };
};
export type PostJob = Res<{
  Body: {
    orgId: string;
    projectId: string;
    type: Jobs['type'];
  };
  Error: CreateJobError;
  Success: { data: ApiJobList };
}>;

// ------ GET /:job_id
export type GetJob = Res<{
  Querystring: {
    org_id: string;
    project_id: string;
  };
  Params: { job_id: string };
  Success: { data: ApiJob };
}>;
