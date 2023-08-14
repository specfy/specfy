import type { Res } from '@specfy/core';
import type { Invitations, Prisma } from '@specfy/db';
import type { ApiOrgPublic } from '../orgs/types.api.js';
import type { DBPerm } from '../perms/types.js';
import type { ApiUser } from '../users/types.api.js';
export type ApiInvitation = Omit<Invitations, 'role' | 'token'> & {
    role: DBPerm['role'];
};
export type InvitationsWithOrgAndUser = Prisma.InvitationsGetPayload<{
    include: {
        Org: true;
        User: true;
    };
}>;
export type ListInvitations = Res<{
    Querystring: {
        org_id: string;
    };
    Success: {
        data: ApiInvitation[];
    };
}>;
export type PostInvitation = Res<{
    Body: Pick<Invitations, 'email' | 'orgId' | 'role'>;
    Success: {
        data: {
            id: string;
            token: string;
        };
    };
}>;
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
export type DeleteInvitation = Res<{
    Params: ParamsInvitation;
    Success: never;
}>;
export type AcceptInvitation = Res<{
    Params: ParamsInvitation;
    Querystring: {
        token: string;
    };
    Success: {
        done: true;
    };
}>;
export type DeclineInvitation = Res<{
    Params: ParamsInvitation;
    Querystring: {
        token: string;
    };
    Success: {
        done: true;
    };
}>;
