import { z } from 'zod';

export const schemaUser = z
  .object({
    name: z.string().min(2).max(50),
  })
  .strict();
