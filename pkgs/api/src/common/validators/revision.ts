import { z } from 'zod';

import { schemaId, schemaOrgId } from './common';
import { schemaProseMirror } from './prosemirror';

export const schemaRevision = z
  .object({
    id: schemaId,
    orgId: schemaOrgId,
    projectId: schemaId,

    name: z.string().min(2).max(75),
    description: schemaProseMirror,
    blobs: z.array(schemaId).max(100),
    locked: z.boolean(),
    merged: z.boolean(),

    status: z.enum(['approved', 'closed', 'draft', 'waiting']),

    authors: z.array(schemaId).max(100),
    reviewers: z.array(schemaId).max(100),

    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),

    mergedAt: z.string().datetime().nullable(),
    closedAt: z.string().datetime().nullable(),
  })
  .strict();
