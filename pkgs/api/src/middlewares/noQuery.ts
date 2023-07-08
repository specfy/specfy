import { z } from 'zod';

import { validationError } from '../common/errors.js';
import type { PreHandler } from '../types/fastify.js';

export const noQuery: PreHandler = (req, res, done) => {
  const val = z.object({}).strict().safeParse(req.query);
  if (!val.success) {
    void validationError(res as any, val.error);
    return;
  }

  done();
};
