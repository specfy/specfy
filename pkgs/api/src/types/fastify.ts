import type { IncomingMessage, ServerResponse } from 'http';

import type { preHandlerHookHandler, RawServerDefault } from 'fastify';
import type { RouteGenericInterface } from 'fastify/types/route';

export type PreHandler<T extends RouteGenericInterface = any> =
  preHandlerHookHandler<
    RawServerDefault,
    IncomingMessage,
    ServerResponse<IncomingMessage>,
    T
  >;
