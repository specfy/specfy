import { pick } from '@specfy/core';
import { toApiUser } from '../users/formatter.js';
export function toApiActivity(act) {
    return {
        id: act.id,
        orgId: act.orgId,
        project: act.Project ? act.Project : undefined,
        user: toApiUser(act.User),
        activityGroupId: act.activityGroupId,
        action: act.action,
        // TODO: reup this
        // targetUser: act.targetUser ? toApiUser(act.targetUser) : undefined,
        targetComponent: act.Blob?.type === 'component'
            ? pick(act.Blob.current, [
                'id',
                'name',
                'slug',
            ])
            : undefined,
        targetDocument: act.Blob?.type === 'document'
            ? pick(act.Blob.current, [
                'id',
                'name',
                'slug',
                'type',
            ])
            : undefined,
        targetRevision: act.Revision
            ? act.Revision
            : undefined,
        // targetPolicy: act.targetPolicy ? act.targetPolicy : undefined,
        createdAt: act.createdAt.toISOString(),
    };
}
