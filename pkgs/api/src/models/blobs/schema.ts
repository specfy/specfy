import { z } from 'zod';

import { schemaId } from '../../common/validators/index.js';
import { v1 } from '../billing/model.js';
import { schemaComponent } from '../components/schema.js';
import { schemaDocument } from '../documents/schema.js';
import { schemaProject } from '../projects/schema.js';

const blobProject = z
  .object({
    parentId: schemaId.nullable(), // TODO: Val that it exists if not created
    type: z.literal('project'),
    typeId: schemaId, // TODO: Val that it exists if not created
    deleted: z.boolean(),
    created: z.boolean(),
    current: schemaProject,
  })
  .strict();
const blobComponent = z
  .object({
    parentId: schemaId.nullable(),
    type: z.literal('component'),
    typeId: schemaId,
    deleted: z.boolean(),
    created: z.boolean(),
    current: schemaComponent,
  })
  .strict();
const blobDocument = z
  .object({
    parentId: schemaId.nullable(),
    type: z.literal('document'),
    typeId: schemaId,
    deleted: z.boolean(),
    created: z.boolean(),
    current: schemaDocument,
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

        if (val.typeId !== val.current.id) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            params: { code: 'incompatible_fields' },
            message: "Blob's id and blob definition should be the same",
          });
        }

        if (val.created && val.type === 'project') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            params: { code: 'incompatible_fields' },
            message: "Can't create project from a Revision",
          });
        }
      })
  )
  .max(v1.pro.upload.maxDocuments);
