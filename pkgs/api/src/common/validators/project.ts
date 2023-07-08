import { z } from 'zod';

import { schemaId, schemaOrgId, schemaSlug } from './common.js';
import { schemaProseMirror } from './prosemirror.js';

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
          title: z.string().max(20),
          url: z.string().url(),
        })
        .strict()
    ),
    githubRepository: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();
