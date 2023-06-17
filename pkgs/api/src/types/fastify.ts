import type { IncomingMessage, ServerResponse } from 'http';

import type { Keys, Orgs, Projects, Users } from '@prisma/client';
import type { preHandlerHookHandler, RawServerDefault } from 'fastify';
import type { RouteGenericInterface } from 'fastify/types/route';

import type { InvitationsWithOrgAndUser } from './api';
import type { PermsWithOrg, RevisionWithProject } from './db';

export type PreHandler<T extends RouteGenericInterface = any> =
  preHandlerHookHandler<
    RawServerDefault,
    IncomingMessage,
    ServerResponse<IncomingMessage>,
    T
  >;

declare module 'fastify' {
  interface FastifyRequest {
    perms?: PermsWithOrg[];
    project?: Projects;
    revision?: RevisionWithProject;
    user?: Users;
    key?: Keys;
    org?: Orgs;
    invitation?: InvitationsWithOrgAndUser;
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
