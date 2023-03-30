import { z } from 'zod';

// import type { DBComponent } from '../../types/db';

import { schemaId, schemaSlug, schemaOrgId } from './common';
import { schemaDisplay, schemaEdges } from './graph';
import { schemaProseMirror } from './prosemirror';

// const allowType: Array<DBComponent['type']> = [
//   'component',
//   'hosting',
//   'project',
//   'thirdparty',
// ]; // TODO: enforce union

export const schemaComponent = z
  .object({
    id: schemaId,
    orgId: schemaOrgId,
    projectId: schemaId,
    blobId: z.string().uuid(),
    techId: z.string().nonempty().nullable(), // TODO: do something about that?

    // type: z.string().refine((val) => {
    //   return allowType.includes(val as any);
    // }),
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
