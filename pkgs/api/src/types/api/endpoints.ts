/* eslint-disable @typescript-eslint/member-ordering */
import type { ListActivities } from './activities.js';
import type { PostAuthLocal, PostLogout } from './auth.js';
import type { ListRevisionBlobs } from './blob.js';
import type { ListComponents } from './components.js';
import type { GetDocument, ListDocuments } from './documents.js';
import type { GetFlow, PatchFlow } from './flows.js';
import type {
  ListGithubInstallations,
  ListGithubRepos,
  PostLinkToGithubOrg,
} from './github.js';
import type {
  AcceptInvitation,
  DeclineInvitation,
  DeleteInvitation,
  GetInvitation,
  ListInvitations,
  PostInvitation,
} from './invitations.js';
import type { ListKeys } from './keys.js';
import type { DeleteMe, GetMe, PutMe } from './me.js';
import type { DeleteOrg, ListOrgs, PostOrg, PutOrg } from './orgs.js';
import type { DeletePerm, GetCountPerms, ListPerms, PutPerm } from './perms.js';
import type { ListPolicies } from './policies.js';
import type {
  DeleteProject,
  GetProject,
  ListProjects,
  PostProject,
  PutProject,
} from './projects.js';
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
} from './revisions.js';
import type { GetRoot } from './root.js';
import type { ListUsers } from './users.js';

export interface API {
  '/0/': { GET: GetRoot };

  '/0/activities': { GET: ListActivities };

  '/0/auth/local': { POST: PostAuthLocal };
  '/0/auth/logout': { POST: PostLogout };

  '/0/components': { GET: ListComponents };

  '/0/documents': { GET: ListDocuments };
  [key: `/0/documents/${string}`]: { GET: GetDocument };

  [key: `/0/flows/${string}`]: { GET: GetFlow; PATCH: PatchFlow };

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
