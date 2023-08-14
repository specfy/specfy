import type { Res } from '@specfy/core';

import type { ApiComponent } from '../components/types.api.js';
import type { ApiDocument } from '../documents/types.api.js';
import type { ApiPolicy } from '../policies/types.api.js';
import type { ApiProject } from '../projects/types.api.js';
import type { ApiRevision } from '../revisions/types.api.js';
import type { ApiUser } from '../users/types.api.js';

import type { DBActivity } from './types.js';

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
