import { z } from 'zod';

import { validationError } from '../common/errors.js';
import type { PreHandler } from '../types/fastify.js';

export const noBody: PreHandler = async (req, res) => {
  if (!req.body) {
    return;
  }

  const val = z.object({}).strict().safeParse(req.body);
  if (!val.success) {
    return validationError(res, val.error);
  }
};
