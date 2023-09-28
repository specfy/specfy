import {
  schemaId,
  schemaOrgId,
  schemaSlug,
  schemaProseMirror,
} from '@specfy/core';
import { z } from 'zod';

export const schemaProject = z
  .object({
    id: schemaId, // TODO: Val that it's the same as typeId
    orgId: schemaOrgId, // TODO: Val that it's the same as topLevel
    blobId: schemaId.nullable(), // TODO: Val that it's the same as topLevel
    slug: schemaSlug,
    name: z.string().min(2).max(36),
    description: schemaProseMirror,
    links: z.array(
      z
        .object({
          title: z.string().max(30),
          url: z.string().url(),
        })
        .strict()
    ),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();
