import { z } from 'zod';

import {
  schemaId,
  schemaSlug,
  schemaOrgId,
} from '../../common/validators/index.js';
import { schemaProseMirror } from '../../common/validators/prosemirror.js';
import { schemaDisplay, schemaEdges } from '../flows/validator.js';

export const schemaComponent = z
  .object({
    id: schemaId,
    orgId: schemaOrgId,
    projectId: schemaId,
    blobId: schemaId.nullable(),
    techId: z.string().nonempty().nullable(), // TODO: do something about that?

    // Can't find a way to sync them
    // type: z.enum([...componentTypes]),
    type: z.enum([
      'app',
      'ci',
      'db',
      'hosting',
      'language',
      'messaging',
      'network',
      'saas',
      'storage',
      'tool',
      'project',
      'service',
    ]),
    typeId: schemaId.nullable(),

    name: z.string().min(2).max(100),
    slug: schemaSlug,
    description: schemaProseMirror,
    techs: z.string().max(25).array(), // TODO: do something about that?

    display: schemaDisplay,
    edges: schemaEdges,

    inComponent: schemaId.nullable(),

    source: z.string().max(100).nullable(),
    sourceName: z.string().max(100).nullable(),
    sourcePath: z.array(z.string().max(500)).max(50).nullable(),

    tags: z.string().max(20).array(),
    show: z.boolean(),

    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();
