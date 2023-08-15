import { schemaOrgId } from '@specfy/core';
import { z } from 'zod';

export const schemaOrg = z
  .object({
    id: schemaOrgId,
    name: z.string().min(4).max(36),
  })
  .strict();
