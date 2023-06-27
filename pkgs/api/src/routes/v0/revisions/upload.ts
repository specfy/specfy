import type { AnalyserJson } from '@specfy/stack-analyser';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { nanoid } from '../../../common/id.js';
import { schemaId, schemaOrgId } from '../../../common/validators/common.js';
import {
  schemaRevision,
  schemaStack,
} from '../../../common/validators/revision.js';
import { valPermissions } from '../../../common/zod.js';
import { prisma } from '../../../db/index.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import { createBlobs, createRevisionActivity } from '../../../models/index.js';
import {
  uploadedDocumentsToDB,
  uploadToDocuments,
} from '../../../models/revisions/helpers.document.js';
import { uploadedStackToDB } from '../../../models/revisions/helpers.stack.js';
import type { PostUploadRevision } from '../../../types/api/index.js';

function BodyVal(req: FastifyRequest) {
  return z
    .object({
      orgId: schemaOrgId,
      projectId: schemaId,
      name: schemaRevision.shape.name,
      description: schemaRevision.shape.description,
      source: z.literal('github'),
      // TODO: validate this
      stack: schemaStack.nullable(),
      blobs: z
        .array(
          z
            .object({
              path: z.string().max(255),
              content: z.string().max(9_999_999),
            })
            .strict()
        )
        .min(0)
        .max(2000),
    })
    .strict()
    .superRefine(valPermissions(req));
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
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
      const parsed = uploadToDocuments(data.blobs);

      const rev = await prisma.$transaction(
        async (tx) => {
          const blobsIds: string[] = [];
          // ---- Handle documents
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
          const blobs = await createBlobs(
            [...documents.blobs, ...documents.deleted],
            tx
          );
          blobsIds.push(...blobs);

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
            const idsBlobsComponents = await createBlobs(
              [
                ...components.blobs.filter((b) => {
                  return !components.unchanged.includes(b.typeId);
                }),
              ],
              tx
            );
            blobsIds.push(...idsBlobsComponents);
          }

          if (blobsIds.length <= 0) {
            res.status(400).send({
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
              description: data.description as any,
              status: 'approved',
              merged: false,
              blobs: blobsIds,
            },
          });

          await createRevisionActivity({
            user: req.user!,
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
              userId: req.user!.id,
              commentId: null,
            },
          });
          await createRevisionActivity({
            user: req.user!,
            action: 'Revision.approved',
            target: revision,
            tx,
          });

          await tx.typeHasUsers.create({
            data: {
              revisionId: revision.id,
              role: 'author',
              userId: req.user!.id,
            },
          });

          return revision;
        },
        { maxWait: 30000, timeout: 30000 }
      );

      if (rev) {
        res.status(200).send({
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
