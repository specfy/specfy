import { z } from 'zod';

import { validationError } from '../common/errors';
import type { PreHandler } from '../types/fastify';

export const noQuery: PreHandler = (req, res, done) => {
  const val = z.object({}).strict().safeParse(req.query);
  if (!val.success) {
    validationError(res, val.error);
    return;
  }

  done();
};
