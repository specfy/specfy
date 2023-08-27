import {
  schemaId,
  schemaOrgId,
  schemaSlug,
  schemaProseMirror,
} from '@specfy/core';
import { z } from 'zod';

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
    format: z.enum(['md', 'pm']),
    content: z.string(),
    hash: z.string().length(64),
    locked: z.boolean(),

    parentId: schemaId.nullable(),
    source: z.string().max(100).nullable(),
    sourcePath: z.string().max(255).nullable(),

    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict()
  .superRefine((val, ctx) => {
    if (val.format === 'pm') {
      try {
        const parsed = schemaProseMirror.safeParse(JSON.parse(val.content));
        if (!parsed.success) {
          for (const err of parsed.error.errors) {
            ctx.addIssue(err);
          }
        }
      } catch (e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          params: { code: 'invalid' },
          message: "A ProseMirror 'format' expect a valid JSON in 'content'",
        });
      }
    }
  });
