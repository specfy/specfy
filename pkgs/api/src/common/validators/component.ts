import { z } from 'zod';

import { schemaId, schemaSlug, schemaOrgId } from './common.js';
import { schemaDisplay, schemaEdges } from './flow.js';
import { schemaProseMirror } from './prosemirror.js';

export const schemaComponent = z
  .object({
    id: schemaId,
    orgId: schemaOrgId,
    projectId: schemaId,
    blobId: schemaId.nullable(),
    techId: z.string().nonempty().nullable(), // TODO: do something about that?

    type: z.enum(['component', 'hosting', 'project', 'thirdparty']),
    typeId: schemaId.nullable(),

    name: z.string().min(2).max(100),
    slug: schemaSlug,
    description: schemaProseMirror,
    tech: z.string().array(), // TODO: do something about that?

    display: schemaDisplay,
    edges: schemaEdges,

    inComponent: schemaId.nullable(),

    source: z.string().max(100).nullable(),
    sourceName: z.string().max(100).nullable(),
    sourcePath: z.array(z.string().max(500)).max(50).nullable(),

    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();
