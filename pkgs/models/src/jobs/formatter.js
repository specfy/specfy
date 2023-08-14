import { toApiUser } from '../users/formatter.js';
export function toApiJob(job) {
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
        user: toApiUser(job.User),
    };
}
