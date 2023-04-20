import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { fastifyPassport } from '../../../middlewares/auth';
import { noQuery } from '../../../middlewares/noQuery';
import type {
  ReqPostAuthLocal,
  ResPostAuthLocalSuccess,
} from '../../../types/api/auth';
import type { PreHandler } from '../../../types/fastify';

const obj = z
  .object({
    email: z.string().max(50),
    password: z.string().max(100),
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
  fastify.post<{
    Body: ReqPostAuthLocal;
    Reply: ResPostAuthLocalSuccess;
  }>(
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
