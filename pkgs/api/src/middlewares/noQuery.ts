import { z } from 'zod';

import { validationError } from '../common/errors.js';
import type { PreHandler } from '../types/fastify.js';

export const noQuery: PreHandler = async (req, res) => {
  const val = z.object({}).strict().safeParse(req.query);
  if (!val.success) {
    void validationError(res, val.error);
    return;
  }
};
