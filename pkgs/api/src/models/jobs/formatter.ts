import type { ApiJob } from '../../types/api/index.js';
import { toApiUser } from '../users/formatter.js';

import type { JobWithUser } from './type.js';

export function toApiJob(job: JobWithUser): ApiJob {
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
