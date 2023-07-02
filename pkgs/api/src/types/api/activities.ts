import type { DBActivity } from '../db/index.js';

import type { Res } from './api.js';
import type { ApiComponent } from './components.js';
import type { ApiDocument } from './documents.js';
import type { ApiPolicy } from './policies.js';
import type { ApiProject } from './projects.js';
import type { ApiRevision } from './revisions.js';
import type { ApiUser } from './users.js';

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
  targetRevision?:
    | Pick<ApiRevision, 'id' | 'locked' | 'merged' | 'name' | 'status'>
    | undefined;
  targetPolicy?: Pick<ApiPolicy, 'id' | 'name'> | undefined;
};
export type ApiActivityGrouped = ApiActivity & { childrens?: ApiActivity[] };

// GET /
export type ListActivities = Res<{
  Querystring: {
    org_id: string;
    project_id?: string | undefined;
    revision_id?: string | undefined;
  };
  Success: {
    data: ApiActivity[];
  };
}>;
