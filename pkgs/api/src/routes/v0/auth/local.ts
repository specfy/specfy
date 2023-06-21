import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { fastifyPassport } from '../../../middlewares/auth';
import { noQuery } from '../../../middlewares/noQuery';
import type { PostAuthLocal } from '../../../types/api/auth';
import type { PreHandler } from '../../../types/fastify';

const obj = z
  .object({
    email: z.string().max(250).email(),
    password: z.string().min(8).max(100),
  })
  .strict();

export const validation: PreHandler = (req, res, done) => {
  const val = obj.safeParse(req.body);
  if (!val.success) {
    return validationError(res, val.error);
  }

  done();
};

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<PostAuthLocal>(
    '/local',
    {
      preHandler: [noQuery, validation, fastifyPassport.authenticate('local')],
    },
    function (_req, res) {
      // nothing todo
      res.status(200).send({ data: { done: true } });
    }
  );

  done();
};

export default fn;
