import type { Activity } from '../../models';
import type { ApiActivity } from '../../types/api';

import { toApiUser } from './user';

export function toApiActivity(act: Activity): ApiActivity {
  return {
    id: act.id,
    orgId: act.orgId,

    project: act.project ? act.project : undefined,
    user: toApiUser(act.user),

    activityGroupId: act.activityGroupId,
    action: act.action,

    targetUser: act.targetUser ? toApiUser(act.targetUser) : undefined,
    targetComponent: act.targetComponent ? act.targetComponent : undefined,
    targetDocument: act.targetDocument ? act.targetDocument : undefined,
    targetRevision: act.targetRevision ? act.targetRevision : undefined,
    targetPolicy: act.targetPolicy ? act.targetPolicy : undefined,

    createdAt: act.createdAt.toISOString(),
  };
}
