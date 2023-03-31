import type { DBActivity } from '../db';

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

// GET /
export interface ReqListActivities {
  org_id: string;
  project_id?: string;
}

export interface ResListActivities {
  data: ApiActivity[];
}