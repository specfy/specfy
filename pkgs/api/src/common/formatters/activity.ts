import type { ApiActivity } from '../../types/api';
import type { ActivitiesList, DBComponent, DBDocument } from '../../types/db';
import { pick } from '../object';

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
    targetComponent:
      act.Blob?.type === 'component'
        ? pick(act.Blob.current as unknown as DBComponent, [
            'id',
            'name',
            'slug',
          ])
        : undefined,
    targetDocument:
      act.Blob?.type === 'document'
        ? pick(act.Blob.current as unknown as DBDocument, [
            'id',
            'name',
            'slug',
            'type',
          ])
        : undefined,
    // targetRevision: act.targetRevision ? act.targetRevision : undefined,
    // targetPolicy: act.targetPolicy ? act.targetPolicy : undefined,

    createdAt: act.createdAt.toISOString(),
  };
}
