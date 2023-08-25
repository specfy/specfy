import type { FastifyReply as Origin } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    perms?: any[];
  }
  type FastifyReply = Origin;
}
