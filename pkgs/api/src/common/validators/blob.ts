import { z } from 'zod';

import { schemaId } from './common';
import { schemaComponent } from './component';
import { schemaDocument } from './document';
import { schemaProject } from './project';

export const schemaBlob = z
  .array(
    z.discriminatedUnion('type', [
      z
        .object({
          parentId: z.string().uuid().nullable(), // TODO: Val that it exists if not created
          type: z.literal('project'),
          typeId: schemaId, // TODO: Val that it exists if not created
          deleted: z.boolean(),
          created: z.boolean(),
          blob: schemaProject,
        })
        .strict(),
      z
        .object({
          parentId: z.string().uuid().nullable(),
          type: z.literal('component'),
          typeId: schemaId,
          deleted: z.boolean(),
          created: z.boolean(),
          blob: schemaComponent,
        })
        .strict(),
      z
        .object({
          parentId: z.string().uuid().nullable(),
          type: z.literal('document'),
          typeId: schemaId,
          deleted: z.boolean(),
          created: z.boolean(),
          blob: schemaDocument,
        })
        .strict(),
    ])
  )
  .nonempty();
