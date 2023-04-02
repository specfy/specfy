import { z } from 'zod';

// import type { DBDocument } from '../../types/db';

import { schemaId, schemaOrgId, schemaSlug } from './common';
import { schemaProseMirror } from './prosemirror';

// const allowed: Array<DBDocument['type']> = ['pb', 'rfc']; // TODO: enforce union

export const schemaDocument = z
  .object({
    id: schemaId,
    orgId: schemaOrgId,
    projectId: schemaId,
    blobId: schemaId,

    // type: z.string().refine((val) => {
    //   return allowed.includes(val as any);
    // }),
    type: z.enum(['pb', 'rfc']),
    typeId: z.number().positive(),

    name: z.string().min(2).max(100),
    slug: schemaSlug,
    tldr: z.string().max(500),
    content: schemaProseMirror,
    locked: z.boolean(),

    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();
