import type { DBActivity } from '../db';

import type { Res } from './api';
import type { ApiComponent } from './components';
import type { ApiDocument } from './documents';
import type { ApiPolicy } from './policies';
import type { ApiProject } from './projects';
import type { ApiRevision } from './revisions';
import type { ApiUser } from './users';

export type ApiActivity = Omit<
  DBActivity,
  | 'projectId'
  | 'targetComponentId'
  | 'targetDocumentId'
  | 'targetPolicyId'
  | 'targetRevisionId'
  | 'targetUserId'
  | 'userId'
> & {
  project?: Pick<ApiProject, 'id' | 'name' | 'slug'> | undefined;
  user: ApiUser;
  targetUser?: ApiUser | undefined;
  targetComponent?: Pick<ApiComponent, 'id' | 'name' | 'slug'> | undefined;
  targetDocument?:
    | Pick<ApiDocument, 'id' | 'name' | 'slug' | 'type'>
    | undefined;
  targetRevision?: Pick<ApiRevision, 'id' | 'name'> | undefined;
  targetPolicy?: Pick<ApiPolicy, 'id' | 'name'> | undefined;
};
export type ApiActivityGrouped = ApiActivity & { childrens?: ApiActivity[] };

// GET /
export type ListActivities = Res<{
  Querystring: {
    org_id: string;
    project_id?: string;
  };
  Success: {
    data: ApiActivity[];
  };
}>;
