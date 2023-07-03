import { z } from 'zod';

import { componentTypes } from '../../models/component/constants.js';

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

    type: z.enum(componentTypes as [string, ...[]]),
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
