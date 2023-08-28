import type { IncomingMessage, ServerResponse } from 'http';

import type { Flows, Keys, Orgs, Projects, Users } from '@specfy/db';
import type {
  preHandlerAsyncHookHandler,
  preHandlerHookHandler,
  RawServerDefault,
} from 'fastify';
import type { RouteGenericInterface } from 'fastify/types/route';

import type { InvitationsWithOrgAndUser } from './invitations';
import type { JobWithUser } from './jobs';
import type { PermsWithOrg } from './perms';
import type { RevisionWithProject } from './revisions';

export type PreHandler<T extends RouteGenericInterface = any> =
  preHandlerAsyncHookHandler<
    RawServerDefault,
    IncomingMessage,
    ServerResponse,
    T
  >;

export type PreHandlerSync<T extends RouteGenericInterface = any> =
  preHandlerHookHandler<RawServerDefault, IncomingMessage, ServerResponse, T>;

declare module 'fastify' {
  interface FastifyRequest {
    perms?: PermsWithOrg[];
    project?: Projects;
    revision?: RevisionWithProject;
    me?: Users;
    user?: Users;
    key?: Keys;
    org?: Orgs;
    invitation?: InvitationsWithOrgAndUser;
    flow?: Flows;
    job?: JobWithUser;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface PassportUser extends Users {
    //
  }
}

declare module '@fastify/secure-session' {
  interface SessionData {
    passport: { id: string };
  }
}
