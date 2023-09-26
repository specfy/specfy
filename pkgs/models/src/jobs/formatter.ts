import { toApiUser } from '../users/formatter.js';

import type { ApiJob, ApiJobList } from './types.api.js';
import type { JobWithUser, JobWithUserAndRevision } from './types.js';

export function toApiJobList(job: JobWithUser): ApiJobList {
  return {
    id: job.id,
    orgId: job.orgId,
    projectId: job.projectId,
    type: job.type,
    typeId: job.typeId,
    status: job.status,
    config: job.config,
    reason: job.reason,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    startedAt: job.startedAt?.toISOString() || null,
    finishedAt: job.finishedAt?.toISOString() || null,
    user: toApiUser(job.User!),
  };
}
export function toApiJob(job: JobWithUserAndRevision, logs: string): ApiJob {
  return {
    ...toApiJobList(job),
    revisionId: job.Revisions.length > 0 ? job.Revisions[0].id : null,
    logs,
  };
}
