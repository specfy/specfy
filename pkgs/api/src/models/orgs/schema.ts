import { z } from 'zod';

import { schemaOrgId } from '../../common/validators/index.js';

export const schemaOrg = z
  .object({
    id: schemaOrgId,
    name: z.string().min(4).max(36),
  })
  .strict();
