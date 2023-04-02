import type { ApiActivity } from '../../types/api';
import type { ActivitiesList } from '../../types/db';

import { toApiUser } from './user';

export function toApiActivity(act: ActivitiesList): ApiActivity {
  return {
    id: act.id,
    orgId: act.orgId,

    project: act.Project ? act.Project : undefined,
    user: toApiUser(act.User),

    activityGroupId: act.activityGroupId,
    action: act.action as ApiActivity['action'],

    // TODO: reup this
    // targetUser: act.targetUser ? toApiUser(act.targetUser) : undefined,
    // targetComponent: act.targetComponent ? act.targetComponent : undefined,
    // targetDocument: act.targetDocument ? act.targetDocument : undefined,
    // targetRevision: act.targetRevision ? act.targetRevision : undefined,
    // targetPolicy: act.targetPolicy ? act.targetPolicy : undefined,

    createdAt: act.createdAt.toISOString(),
  };
}
