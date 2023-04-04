import { z } from 'zod';

import { schemaId } from './common';
import { schemaComponent } from './component';
import { schemaDocument } from './document';
import { schemaProject } from './project';

const blobProject = z
  .object({
    parentId: schemaId.nullable(), // TODO: Val that it exists if not created
    type: z.literal('project'),
    typeId: schemaId, // TODO: Val that it exists if not created
    deleted: z.boolean(),
    created: z.boolean(),
    blob: schemaProject,
  })
  .strict();
const blobComponent = z
  .object({
    parentId: schemaId.nullable(),
    type: z.literal('component'),
    typeId: schemaId,
    deleted: z.boolean(),
    created: z.boolean(),
    blob: schemaComponent,
  })
  .strict();
const blobDocument = z
  .object({
    parentId: schemaId.nullable(),
    type: z.literal('document'),
    typeId: schemaId,
    deleted: z.boolean(),
    created: z.boolean(),
    blob: schemaDocument,
  })
  .strict();

export const schemaBlobs = z
  .array(
    z
      .discriminatedUnion('type', [blobProject, blobComponent, blobDocument])
      .superRefine((val, ctx) => {
        if (val.created && val.deleted) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            params: { code: 'incompatible_fields' },
            message: 'Deleted and Created can not be both true',
          });
        }
        if (!val.created && !val.parentId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            params: { code: 'incompatible_fields' },
            message: 'Updated blob should come with a parentId',
          });
        }
        if (val.typeId !== val.blob.id) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            params: { code: 'incompatible_fields' },
            message: "Blob's id and blob definition should be the same",
          });
        }
      })
  )
  .max(200);
