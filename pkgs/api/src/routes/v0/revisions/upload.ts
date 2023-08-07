import type { AnalyserJson } from '@specfy/stack-analyser';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { nanoid } from '../../../common/id.js';
import { schemaId, schemaOrgId } from '../../../common/validators/index.js';
import { valPermissions } from '../../../common/zod.js';
import { prisma } from '../../../db/index.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import {
  createBlobs,
  createRevisionActivity,
  v1,
} from '../../../models/index.js';
import {
  uploadedDocumentsToDB,
  uploadToDocuments,
} from '../../../models/revisions/helpers.document.js';
import {
  autoLayout,
  uploadedStackToDB,
} from '../../../models/revisions/helpers.stack.js';
import {
  schemaRevision,
  schemaStack,
} from '../../../models/revisions/schema.js';
import type { PostUploadRevision } from '../../../types/api/index.js';

function BodyVal(req: FastifyRequest) {
  return z
    .object({
      orgId: schemaOrgId,
      projectId: schemaId,
      name: schemaRevision.shape.name,
      description: schemaRevision.shape.description,
      source: z.literal('github'),
      autoLayout: z.boolean().nullable(),
      stack: schemaStack.nullable(),
      blobs: z
        .array(
          z
            .object({
              path: z.string().max(255),
              content: z.string().max(v1.pro.upload.maxDocumentSize),
            })
            .strict()
        )
        .min(0)
        .max(v1.pro.upload.maxDocuments)
        .nullable()
        .superRefine((blobs, ctx) => {
          if (!blobs) {
            return;
          }

          const paths = new Set();
          for (let index = 0; index < blobs.length; index++) {
            const blob = blobs[index];
            if (paths.has(blob.path)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                params: { code: 'duplicate' },
                message: 'Path already exists',
                path: [index, 'path'],
              });
              continue;
            }
            if (blob.path === '/') {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                params: { code: 'invalid' },
                message: 'Root level path ("/") is not allowed',
                path: [index, 'path'],
              });
              continue;
            }

            paths.add(blob.path);
          }
        }),
    })
    .strict()
    .partial({ autoLayout: true })
    .superRefine(valPermissions(req, 'contributor'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post<PostUploadRevision>(
    '/',
    { preHandler: noQuery },
    async function (req, res) {
      const val = BodyVal(req).safeParse(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      // TODO: validate all ids
      const data = val.data;
      const parsed = data.blobs ? uploadToDocuments(data.blobs) : [];

      const rev = await prisma.$transaction(
        async (tx) => {
          const blobsIds: string[] = [];
          // ---- Handle documents
          if (data.blobs) {
            const prevsDocuments = await tx.documents.findMany({
              where: {
                orgId: data.orgId,
                projectId: data.projectId,
                type: 'doc',
                source: data.source,
              },
              take: 1000,
              skip: 0,
            });

            const documents = uploadedDocumentsToDB(
              parsed,
              prevsDocuments,
              data as PostUploadRevision['Body']
            );

            // Insert in db
            const blobs = await createBlobs(
              [...documents.blobs, ...documents.deleted],
              tx
            );
            blobsIds.push(...blobs);
          }

          // ---- Handle stack
          if (data.stack) {
            const prevsComponents = await tx.components.findMany({
              where: {
                orgId: data.orgId,
                projectId: data.projectId,
              },
              take: 1000,
              skip: 0,
            });
            const components = uploadedStackToDB(
              data.stack as AnalyserJson,
              prevsComponents,
              data as PostUploadRevision['Body']
            );

            if (data.autoLayout) {
              autoLayout(components);
            }

            // Insert in db
            const idsBlobsComponents = await createBlobs(
              [
                ...components.blobs.filter((b) => {
                  return !components.unchanged.includes(b.typeId);
                }),
                ...components.deleted,
              ],
              tx
            );
            blobsIds.push(...idsBlobsComponents);
          }

          if (blobsIds.length <= 0) {
            return res.status(400).send({
              error: {
                code: 'cant_create',
                reason: 'no_diff',
              },
            });
            return;
          }

          // ---- Create Revision
          const revision = await tx.revisions.create({
            data: {
              id: nanoid(),
              orgId: data.orgId,
              projectId: data.projectId,
              name: data.name,
              description: data.description,
              status: 'approved',
              merged: false,
              blobs: blobsIds,
            },
          });

          await createRevisionActivity({
            user: req.me!,
            action: 'Revision.created',
            target: revision,
            tx,
          });

          await tx.reviews.create({
            data: {
              id: nanoid(),
              orgId: data.orgId,
              projectId: data.projectId,
              revisionId: revision.id,
              userId: req.me!.id,
              commentId: null,
            },
          });
          await createRevisionActivity({
            user: req.me!,
            action: 'Revision.approved',
            target: revision,
            tx,
          });

          await tx.typeHasUsers.create({
            data: {
              revisionId: revision.id,
              role: 'author',
              userId: req.me!.id,
            },
          });

          return revision;
        },
        { maxWait: 30000, timeout: 30000 }
      );

      if (rev) {
        return res.status(200).send({
          id: rev.id,
        });
      } else {
        if (res.sent) {
          throw new Error('Error while uploading');
        }
      }
    }
  );
  done();
};

export default fn;
