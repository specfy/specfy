/* eslint-disable @typescript-eslint/member-ordering */

import type {
  ListActivities,
  GetBillingUsage,
  GetSubscription,
  PostStripeWebhook,
  PostSubscription,
  ListRevisionBlobs,
  ListComponents,
  GetDocument,
  ListDocuments,
  GetFlow,
  PatchFlow,
  GetGithubMembers,
  ListGithubInstallations,
  ListGithubRepos,
  PostGithubWebhook,
  PostLinkToGithubOrg,
  PostLinkToGithubProject,
  AcceptInvitation,
  DeclineInvitation,
  DeleteInvitation,
  GetInvitation,
  ListInvitations,
  PostInvitation,
  ListJobs,
  GetJob,
  ListKeys,
  DeleteOrg,
  ListOrgs,
  PostOrg,
  PutOrg,
  DeletePerm,
  GetCountPerms,
  ListPerms,
  PutPerm,
  ListPolicies,
  DeleteProject,
  GetProject,
  ListProjects,
  PostProject,
  PutProject,
  CommentRevision,
  GetRevision,
  ListRevisionChecks,
  ListRevisions,
  MergeRevision,
  PatchRevision,
  PostRevision,
  PostUploadRevision,
  RebaseRevision,
  GetUser,
  ListUsers,
  DeleteMe,
  GetMe,
  PutMe,
  PostFeedback,
  PostDemo,
} from '@specfy/models';

import type { PostAuthLocal, PostLogout } from './auth.js';
import type { GetRoot } from './root.js';

export interface API {
  '/0/': { GET: GetRoot };

  '/0/activities': { GET: ListActivities };

  '/0/auth/local': { POST: PostAuthLocal };
  '/0/auth/logout': { POST: PostLogout };

  '/0/stripe/webhooks': { POST: PostStripeWebhook };
  [key: `/0/stripe/${string}/subscription`]: {
    GET: GetSubscription;
    POST: PostSubscription;
  };
  [key: `/0/stripe/${string}/usage`]: { GET: GetBillingUsage };

  '/0/components': { GET: ListComponents };

  '/0/demo': { POST: PostDemo };

  '/0/documents': { GET: ListDocuments };
  [key: `/0/documents/${string}`]: { GET: GetDocument };

  '/0/feedbacks': { POST: PostFeedback };

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
  [key: `/0/users/${string}`]: { GET: GetUser };

  '/0/github/installations': { GET: ListGithubInstallations };
  '/0/github/link_org': { POST: PostLinkToGithubOrg };
  '/0/github/link_project': { POST: PostLinkToGithubProject };
  '/0/github/members': { GET: GetGithubMembers };
  '/0/github/repos': { GET: ListGithubRepos };
  '/0/github/webhooks': { POST: PostGithubWebhook };

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
