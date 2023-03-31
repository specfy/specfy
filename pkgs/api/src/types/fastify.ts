import type { IncomingMessage, ServerResponse } from 'http';

import type { preHandlerHookHandler, RawServerDefault } from 'fastify';
import type { RouteGenericInterface } from 'fastify/types/route';

import type { Perm, Project, Revision, User } from '../models';

export type PreHandler<T extends RouteGenericInterface = any> =
  preHandlerHookHandler<
    RawServerDefault,
    IncomingMessage,
    ServerResponse<IncomingMessage>,
    T
  >;

declare module 'fastify' {
  interface FastifyRequest {
    perms?: Perm[];
    project?: Project;
    revision?: Revision;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface PassportUser extends User {}
}
