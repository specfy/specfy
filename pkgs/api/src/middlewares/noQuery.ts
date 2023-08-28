import type { PreHandler } from '@specfy/models/src/fastify';
import { z } from 'zod';

import { validationError } from '../common/errors.js';

export const noQuery: PreHandler = async (req, res) => {
  const val = z.object({}).strict().safeParse(req.query);
  if (!val.success) {
    void validationError(res, val.error);
    return;
  }
};
