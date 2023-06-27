import { z } from 'zod';

// import type { DBDocument } from '../../types/db/index.js';

import { schemaId, schemaOrgId, schemaSlug } from './common.js';
import { schemaProseMirror } from './prosemirror.js';

// const allowed: Array<DBDocument['type']> = ['pb', 'rfc']; // TODO: enforce union

export const schemaDocument = z
  .object({
    id: schemaId,
    orgId: schemaOrgId,
    projectId: schemaId,
    blobId: schemaId.nullable(),

    // type: z.string().refine((val) => {
    //   return allowed.includes(val as any);
    // }),
    type: z.enum(['pb', 'rfc', 'doc']),
    typeId: z.number().positive().nullable(),

    name: z.string().min(2).max(100),
    slug: schemaSlug,
    tldr: z.string().max(500),
    content: schemaProseMirror,
    locked: z.boolean(),

    parentId: schemaId.nullable(),
    source: z.string().max(100).nullable(),
    sourcePath: z.string().max(255).nullable(),

    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();
