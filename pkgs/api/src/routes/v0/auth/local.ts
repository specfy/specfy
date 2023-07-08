import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { fastifyPassport } from '../../../middlewares/auth/index.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import type { PostAuthLocal } from '../../../types/api/auth.js';
import type { PreHandler } from '../../../types/fastify.js';

const obj = z
  .object({
    email: z.string().max(250).email(),
    password: z.string().min(8).max(100),
  })
  .strict();

export const validation: PreHandler = (req, res, done) => {
  const val = obj.safeParse(req.body);
  if (!val.success) {
    void validationError(res as any, val.error);
    return;
  }

  done();
};

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post<PostAuthLocal>(
    '/local',
    {
      preHandler: [noQuery, validation, fastifyPassport.authenticate('local')],
    },
    async function (_req, res) {
      // nothing todo
      return res.status(200).send({ data: { done: true } });
    }
  );

  done();
};

export default fn;
