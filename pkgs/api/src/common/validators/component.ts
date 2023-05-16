import { z } from 'zod';

import { schemaId, schemaSlug, schemaOrgId } from './common';
import { schemaDisplay, schemaEdges } from './flow';
import { schemaProseMirror } from './prosemirror';

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

    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();
