import type { Invitations, Prisma } from '@prisma/client';

import type { PermType } from '../db';

import type { ResErrors } from './api';
import type { ApiOrg } from './orgs';
import type { ApiUser } from './users';

export type ApiInvitation = Omit<Invitations, 'role' | 'token'> & {
  role: PermType;
};

export type InvitationsWithOrgAndUser = Prisma.InvitationsGetPayload<{
  include: { Org: true; User: true };
}>;

// GET /
export interface ReqListInvitations {
  org_id: string;
}
export interface ResListInvitationsSuccess {
  data: ApiInvitation[];
}
export type ResListInvitations = ResErrors | ResListInvitationsSuccess;

// POST /
export type ReqPostInvitations = Pick<Invitations, 'email' | 'orgId' | 'role'>;
export interface ResPostInvitationsSuccess {
  data: { id: string; token: string };
}
export type ResPostInvitations = ResErrors | ResPostInvitationsSuccess;

// GET /:id
export interface ReqInvitationParams {
  invitation_id: string;
}
export interface ReqGetInvitation {
  token: string;
}
export interface ResGetInvitationSuccess {
  data: ApiInvitation & {
    by: ApiUser;
    org: ApiOrg;
  };
}
export type ResGetInvitation = ResErrors | ResGetInvitationSuccess;

// DELETE /:id
export type ResDeleteInvitation = ResErrors | never;

// POST /:id
export type ResAcceptInvitation = ResErrors | { done: true };
