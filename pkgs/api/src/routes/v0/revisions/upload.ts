import path from 'node:path';

import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import {
  getDocumentTitle,
  uploadToDocuments,
} from '../../../common/document.js';
import { validationError } from '../../../common/errors.js';
import { nanoid } from '../../../common/id.js';
import { slugify } from '../../../common/string.js';
import { schemaRevision } from '../../../common/validators/revision.js';
import { valOrgId, valProjectId } from '../../../common/zod.js';
import { prisma } from '../../../db/index.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import { createBlobs, createRevisionActivity } from '../../../models/index.js';
import type {
  ApiBlobCreate,
  ApiBlobCreateDocument,
  PostUploadRevision,
} from '../../../types/api/index.js';
import type { DBDocument } from '../../../types/db/index.js';

function BodyVal(req: FastifyRequest) {
  return z
    .object({
      orgId: valOrgId(req),
      projectId: valProjectId(req),
      name: schemaRevision.shape.name,
      description: schemaRevision.shape.description,
      source: z.literal('github'),
      stack: z.object({}).nullable(), // TODO: validate this
      blobs: z
        .array(
          z
            .object({
              path: z.string().max(255),
              content: z.string().max(99999),
            })
            .strict()
        )
        .min(0)
        .max(100),
    })
    .strict();
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

      const rev = await prisma.$transaction(async (tx) => {
        const prevs = await tx.documents.findMany({
          where: {
            orgId: data.orgId,
            projectId: data.projectId,
            type: 'doc',
          },
          take: 1000,
          skip: 0,
        });

        // ---- Prepare blobs for create or update
        const now = new Date().toISOString();
        const blobs: ApiBlobCreateDocument[] = parsed.map((doc) => {
          const prev = prevs.find((p) => p.sourcePath === doc.path);

          const name = getDocumentTitle(doc, prev);

          const current: DBDocument = prev
            ? {
                ...(prev as unknown as DBDocument),
                name,
                slug: slugify(name),
                content: doc.content,
                source: data.source,
                sourcePath: doc.path,
              }
            : {
                id: nanoid(),
                blobId: null,
                content: doc.content,
                locked: false,
                name,
                orgId: data.orgId,
                projectId: data.projectId,
                parentId: null,
                source: data.source,
                sourcePath: doc.path,
                slug: slugify(name),
                tldr: '',
                type: 'doc',
                typeId: null,
                createdAt: now,
                updatedAt: now,
              };
          return {
            created: !prev,
            deleted: false,
            parentId: prev ? prev.blobId : null,
            type: 'document',
            typeId: prev ? prev.id : nanoid(),
            current,
          };
        });

        // ---- Find blobs parents to construct hierarchy
        blobs.forEach((blob) => {
          const folder = path.join(
            path.dirname(blob.current!.sourcePath!),
            '/'
          );
          const parent = blobs.find(
            (b) => b.current!.sourcePath === folder && b.typeId !== blob.typeId
          );
          if (!parent) {
            return;
          }

          blob.current!.parentId = parent!.current!.id;
        });

        // ---- Create Deleted blobs
        const deleted: ApiBlobCreate[] = prevs
          .filter((p) => !parsed.find((d) => d.path === p.sourcePath))
          .map((prev) => {
            return {
              created: false,
              deleted: true,
              parentId: prev.blobId,
              type: 'document',
              typeId: prev.id,
              current: undefined as unknown as null,
            };
          });

        const ids = await createBlobs([...blobs, ...deleted], tx);

        // TODO: validation
        const revision = await tx.revisions.create({
          data: {
            id: nanoid(),
            orgId: data.orgId,
            projectId: data.projectId,
            name: data.name,
            description: data.description as any,
            status: 'approved',
            merged: false,
            blobs: ids,
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
      });

      res.status(200).send({
        id: rev.id,
      });
    }
  );

  done();
};

export default fn;
