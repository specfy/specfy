/* eslint-disable @typescript-eslint/member-ordering */

import type { ListActivities } from '../../models/activities/types.api.js';
import type { ListRevisionBlobs } from '../../models/blobs/types.api.js';
import type { ListComponents } from '../../models/components/types.api.js';
import type {
  GetDocument,
  ListDocuments,
} from '../../models/documents/types.api.js';
import type { GetFlow, PatchFlow } from '../../models/flows/types.api.js';
import type {
  ListGithubInstallations,
  ListGithubRepos,
  PostLinkToGithubOrg,
} from '../../models/github/types.api.js';
import type {
  AcceptInvitation,
  DeclineInvitation,
  DeleteInvitation,
  GetInvitation,
  ListInvitations,
  PostInvitation,
} from '../../models/invitations/types.api.js';
import type { ListJobs, GetJob } from '../../models/jobs/type.api.js';
import type { ListKeys } from '../../models/keys/types.api.js';
import type {
  DeleteOrg,
  ListOrgs,
  PostOrg,
  PutOrg,
} from '../../models/orgs/types.api.js';
import type {
  DeletePerm,
  GetCountPerms,
  ListPerms,
  PutPerm,
} from '../../models/perms/types.api.js';
import type { ListPolicies } from '../../models/policies/types.api.js';
import type {
  DeleteProject,
  GetProject,
  ListProjects,
  PostProject,
  PutProject,
} from '../../models/projects/types.api.js';
import type {
  CommentRevision,
  GetRevision,
  ListRevisionChecks,
  ListRevisions,
  MergeRevision,
  PatchRevision,
  PostRevision,
  PostUploadRevision,
  RebaseRevision,
} from '../../models/revisions/types.api.js';
import type { ListUsers } from '../../models/users/types.api.js';

import type { PostAuthLocal, PostLogout } from './auth.js';
import type { DeleteMe, GetMe, PutMe } from './me.js';
import type { GetRoot } from './root.js';

export interface API {
  '/0/': { GET: GetRoot };

  '/0/activities': { GET: ListActivities };

  '/0/auth/local': { POST: PostAuthLocal };
  '/0/auth/logout': { POST: PostLogout };

  '/0/components': { GET: ListComponents };

  '/0/documents': { GET: ListDocuments };
  [key: `/0/documents/${string}`]: { GET: GetDocument };

  [key: `/0/flows/${string}`]: { GET: GetFlow; PATCH: PatchFlow };

  '/0/jobs': { GET: ListJobs };
  [key: `/0/jobs/${string}`]: { GET: GetJob };

  '/0/keys': { GET: ListKeys };

  '/0/me': {
    GET: GetMe;
    PUT: PutMe;
    DELETE: DeleteMe;
  };

  '/0/orgs': {
    GET: ListOrgs;
    POST: PostOrg;
  };
  [key: `/0/orgs/${string}`]: {
    PUT: PutOrg;
    DELETE: DeleteOrg;
  };

  '/0/perms': {
    GET: ListPerms;
    PUT: PutPerm;
    DELETE: DeletePerm;
  };
  '/0/perms/count': { GET: GetCountPerms };

  '/0/policies': { GET: ListPolicies };

  '/0/projects': {
    GET: ListProjects;
    POST: PostProject;
  };
  [key: `/0/projects/${string}`]: {
    GET: GetProject;
    PUT: PutProject;
    DELETE: DeleteProject;
  };

  '/0/revisions': {
    GET: ListRevisions;
    POST: PostRevision;
  };
  // @ts-expect-error
  '/0/revisions/upload': { POST: PostUploadRevision };

  // @ts-expect-error
  [key: `/0/revisions/${string}/blobs`]: { GET: ListRevisionBlobs };
  // @ts-expect-error
  [key: `/0/revisions/${string}/checks`]: {
    GET: ListRevisionChecks;
  };
  // @ts-expect-error
  [key: `/0/revisions/${string}/comment`]: {
    POST: CommentRevision;
  };
  // @ts-expect-error
  [key: `/0/revisions/${string}/merge`]: {
    POST: MergeRevision;
  };
  // @ts-expect-error
  [key: `/0/revisions/${string}/rebase`]: {
    POST: RebaseRevision;
  };
  [key: `/0/revisions/${string}`]: {
    GET: GetRevision;
    PATCH: PatchRevision;
    DELETE: DeleteInvitation;
  };

  '/0/users': { GET: ListUsers };

  '/0/github/installations': { GET: ListGithubInstallations };
  '/0/github/repos': { GET: ListGithubRepos };
  '/0/github/link_org': { POST: PostLinkToGithubOrg };

  '/0/invitations': {
    GET: ListInvitations;
    POST: PostInvitation;
  };

  // @ts-expect-error
  [key: `/0/invitations/${string}/accept`]: { POST: AcceptInvitation };
  // @ts-expect-error
  [key: `/0/invitations/${string}/decline`]: { POST: DeclineInvitation };
  [key: `/0/invitations/${string}`]: {
    GET: GetInvitation;
    DELETE: DeleteInvitation;
  };
}

export type APIPaths = keyof API;
