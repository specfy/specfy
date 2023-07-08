import { z } from 'zod';

import { schemaId, schemaOrgId, schemaSlug } from './common.js';
import { schemaProseMirror } from './prosemirror.js';

export const schemaDocument = z
  .object({
    id: schemaId,
    orgId: schemaOrgId,
    projectId: schemaId,
    blobId: schemaId.nullable(),

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
