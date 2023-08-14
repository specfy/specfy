import type { Res } from '@specfy/core';
import type { Invitations, Prisma } from '@specfy/db';

import type { ApiOrgPublic } from '../orgs/types.api.js';
import type { DBPerm } from '../perms/types.js';
import type { ApiUser } from '../users/types.api.js';

export type ApiInvitation = Omit<Invitations, 'role' | 'token'> & {
  role: DBPerm['role'];
};

export type InvitationsWithOrgAndUser = Prisma.InvitationsGetPayload<{
  include: { Org: true; User: true };
}>;

// GET /
export type ListInvitations = Res<{
  Querystring: {
    org_id: string;
  };
  Success: {
    data: ApiInvitation[];
  };
}>;

// POST /
export type PostInvitation = Res<{
  Body: Pick<Invitations, 'email' | 'orgId' | 'role'>;
  Success: {
    data: { id: string; token: string };
  };
}>;

// GET /:id
export interface ParamsInvitation {
  invitation_id: string;
}
export type GetInvitation = Res<{
  Params: ParamsInvitation;
  Querystring: {
    token: string;
  };
  Success: {
    data: ApiInvitation & {
      by: ApiUser;
      org: ApiOrgPublic;
    };
  };
}>;

// DELETE /:id
export type DeleteInvitation = Res<{
  Params: ParamsInvitation;
  Success: never;
}>;

// POST /:id/accept
export type AcceptInvitation = Res<{
  Params: ParamsInvitation;
  Querystring: {
    token: string;
  };
  Success: { done: true };
}>;

// POST /:id/decline
export type DeclineInvitation = Res<{
  Params: ParamsInvitation;
  Querystring: {
    token: string;
  };
  Success: { done: true };
}>;
