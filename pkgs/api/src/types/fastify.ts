import type { IncomingMessage, ServerResponse } from 'http';

import type { Flows, Keys, Orgs, Projects, Users } from '@prisma/client';
import type {
  preHandlerAsyncHookHandler,
  preHandlerHookHandler,
  RawServerDefault,
} from 'fastify';
import type { RouteGenericInterface } from 'fastify/types/route';

import type { JobWithUser } from '../models/jobs/type.js';
import type { PermsWithOrg } from '../models/perms/types.js';
import type { RevisionWithProject } from '../models/revisions/types.js';

import type { InvitationsWithOrgAndUser } from './api/index.js';

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
