import { z } from 'zod';

import { schemaId, schemaOrgId } from './common.js';
import { max } from './flow.constants.js';
import { schemaProseMirror } from './prosemirror.js';

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

const schemaStackBase = z
  .object({
    id: schemaId,
    name: z.string().max(100),
    path: z.array(z.string().max(500)).max(50),
    tech: z.string().max(50).nullable(),
    techs: z.array(z.string().max(50)).max(250),
    inComponent: schemaId.nullable(),
    languages: z.record(
      z.string().min(1).max(50),
      z.number().positive().max(999_999_999)
    ),
    edges: z
      .array(
        z
          .object({
            to: schemaId,
            portSource: z.enum(['bottom', 'left', 'right', 'top']),
            portTarget: z.enum(['bottom', 'left', 'right', 'top']),
            read: z.boolean(),
            write: z.boolean(),
            vertices: z.array(
              z
                .object({
                  x: z.number().positive().max(max),
                  y: z.number().positive().max(max),
                })
                .strict()
            ),
          })
          .strict()
      )
      .max(50),
    dependencies: z
      .array(
        z.tuple([z.string().max(100), z.string().max(100), z.string().max(100)])
      )
      .max(1000),
  })
  .strict();

type IntermediataStackSchema = z.infer<typeof schemaStackBase> & {
  childs: IntermediataStackSchema[];
};

export const schemaStack: z.ZodType<IntermediataStackSchema> =
  schemaStackBase.extend({
    childs: z.lazy(() => schemaStack.array()),
  });
