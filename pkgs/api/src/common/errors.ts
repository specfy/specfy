import type { FastifyReply } from 'fastify';

export function notFound(res: FastifyReply): void {
  res.status(404).send({
    error: {
      code: '404_NOT_FOUND',
    },
  });
}
