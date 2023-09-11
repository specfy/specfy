import { nanoid, schemaId, schemaOrgId } from '@specfy/core';
import { prisma } from '@specfy/db';
import {
  v1,
  createBlobs,
  createRevisionActivity,
  uploadedDocumentsToDB,
  schemaRevision,
  schemaStack,
  DocumentsParser,
  autoLayout,
  stackToBlobs,
} from '@specfy/models';
import type {
  DocsToBlobs,
  PostUploadRevision,
  StackToBlobs,
} from '@specfy/models';
import type { AnalyserJson } from '@specfy/stack-analyser';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { TransactionError, validationError } from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';
import { noQuery } from '../../../middlewares/noQuery.js';

function BodyVal(req: FastifyRequest) {
  // TODO: adapt limitation with plan
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

      const project = await prisma.projects.findUnique({
        where: { id: data.projectId },
      });
      const parser = new DocumentsParser(data.blobs || [], project!);
      const parsed = parser.parse();

      let statsStack: StackToBlobs['stats'] | undefined;
      let statsDocs: DocsToBlobs['stats'] | undefined;
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
              [
                ...documents.blobs.filter((b) => {
                  return !documents.unchanged.includes(b.typeId);
                }),
                ...documents.deleted,
              ],
              tx
            );
            blobsIds.push(...blobs);
            statsDocs = documents.stats;
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
            const components = stackToBlobs(
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
            statsStack = components.stats;
          }

          if (blobsIds.length <= 0) {
            throw new TransactionError<PostUploadRevision['Errors']>({
              error: { code: 'cant_create', reason: 'no_diff' },
            });
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
          data: { id: rev.id, stats: { stack: statsStack, docs: statsDocs } },
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
