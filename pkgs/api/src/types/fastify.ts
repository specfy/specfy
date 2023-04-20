import type { IncomingMessage, ServerResponse } from 'http';

import type { Projects, Revisions, Users } from '@prisma/client';
import type { preHandlerHookHandler, RawServerDefault } from 'fastify';
import type { RouteGenericInterface } from 'fastify/types/route';

import type { PermsWithOrg } from './db';

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
    revision?: Revisions;
    user?: Users;
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
