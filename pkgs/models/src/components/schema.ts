import {
  schemaId,
  schemaSlug,
  schemaOrgId,
  schemaProseMirror,
  schemaSource,
} from '@specfy/core';
import { z } from 'zod';

import { schemaDisplay, schemaEdges } from '../flows/validator.js';

export const schemaComponent = z
  .object({
    id: schemaId,
    orgId: schemaOrgId,
    projectId: schemaId,
    blobId: schemaId.nullable(),
    techId: z.string().nonempty().nullable(), // TODO: do something about that?

    // TODO: sync this list
    // Can't find a way to sync them
    // type: z.enum([...componentTypes]),
    type: z.enum([
      'analytics',
      'api',
      'app',
      'ci',
      'cloud',
      'db',
      'etl',
      'hosting',
      'language',
      'messaging',
      'monitoring',
      'network',
      'project',
      'saas',
      'service',
      'storage',
      'tool',
    ]),
    typeId: schemaId.nullable(),

    name: z.string().min(2).max(100),
    slug: schemaSlug,
    description: schemaProseMirror,
    techs: z.array(
      z
        .object({ id: z.string().max(35), source: schemaSource })
        .strict()
        .partial({ source: true })
    ),

    display: schemaDisplay,
    edges: schemaEdges,

    inComponent: z
      .object({ id: schemaId.nullable(), source: schemaSource })
      .strict()
      .partial({ source: true }),

    source: schemaSource.nullable(),
    sourceName: z.string().max(100).nullable(),
    sourcePath: z.array(z.string().max(500)).max(50).nullable(),

    tags: z.string().max(20).array(),
    show: z.boolean(),

    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();
