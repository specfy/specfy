import type { Prisma } from '@prisma/client';
import type { FastifyPluginCallback } from 'fastify';

import { findAllBlobsWithParent } from '../../../common/blobs';
import { checkReviews } from '../../../common/revision';
import { prisma } from '../../../db';
import { getRevision } from '../../../middlewares/getRevision';
import { createComponentActivity } from '../../../models/component';
import { createDocumentActivity } from '../../../models/document';
import { createProjectActivity } from '../../../models/project';
import { createRevisionActivity } from '../../../models/revision';
import type {
  ReqGetRevision,
  ReqRevisionParams,
  ResMergeRevision,
} from '../../../types/api';
import type { DBBlob } from '../../../types/db';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{
    Params: ReqRevisionParams;
    Querystring: ReqGetRevision;
    Reply: ResMergeRevision;
  }>('/', { preHandler: getRevision }, async function (req, res) {
    const rev = req.revision!;
    let cantMerge: string | false = false;
    const user = req.user!;

    await prisma.$transaction(async (tx) => {
      // Check if we have reviews
      const reviews = await checkReviews(rev, tx);
      if (!reviews.check) {
        cantMerge = 'missing_checks';
        throw new Error(cantMerge);
      }

      // TODO: check who can merge

      // Merge all blobs
      const list = await findAllBlobsWithParent(
        rev.blobs as string[],
        tx,
        true
      );
      for (const item of list) {
        // If we can't find the prev, that means it's not longer in the main branch
        if (!item.parent && item.blob.parentId) {
          cantMerge = 'not_up_to_date';
          throw new Error(cantMerge);
        }

        // Update a blob

        const blob = item.blob as unknown as DBBlob;

        // --- Projects
        if (blob.type === 'project') {
          if (blob.deleted) {
            const del = await tx.projects.delete({
              where: { id: blob.typeId },
            });
            await createProjectActivity(user, 'Project.deleted', del, tx);
            continue;
          } else if (item.parent) {
            const up = await tx.projects.update({
              data: { ...(item.blob.blob as any), blobId: item.blob.id },
              where: { id: blob.typeId },
            });
            await createProjectActivity(user, 'Project.updated', up, tx);
            continue;
          }

          const created = await tx.projects.create({
            data: {
              ...(blob.blob! as unknown as Prisma.ProjectsUncheckedCreateInput),
              blobId: blob.id,
            },
          });
          await createProjectActivity(user, 'Project.created', created, tx);
          continue;
        }

        // --- Components
        if (blob.type === 'component') {
          if (item.blob.deleted) {
            const del = await tx.components.delete({
              where: { id: blob.typeId },
            });
            await createComponentActivity(user, 'Component.deleted', del, tx);
            continue;
          } else if (item.parent) {
            const up = await tx.components.update({
              data: { ...(item.blob.blob as any), blobId: item.blob.id },
              where: { id: blob.typeId },
            });
            await createComponentActivity(user, 'Component.updated', up, tx);
            continue;
          }

          const created = await tx.components.create({
            data: {
              ...(blob.blob! as unknown as Prisma.ComponentsUncheckedCreateInput),
              blobId: blob.id,
            },
          });

          await createComponentActivity(user, 'Component.created', created, tx);
          continue;
        }

        // --- Documents
        if (blob.type === 'document') {
          if (blob.deleted) {
            const del = await tx.documents.delete({
              where: { id: blob.typeId },
            });
            await createDocumentActivity(user, 'Document.deleted', del, tx);
            continue;
          } else if (item.parent) {
            const up = await tx.documents.update({
              data: { ...(item.blob.blob as any), blobId: item.blob.id },
              where: { id: blob.typeId },
            });
            await createDocumentActivity(user, 'Document.updated', up, tx);
            continue;
          }

          const created = await tx.documents.create({
            data: {
              ...(blob.blob! as unknown as Prisma.DocumentsUncheckedCreateInput),
              blobId: blob.id,
            },
          });
          await createDocumentActivity(user, 'Document.created', created, tx);
        }
      }

      // Update revision
      const updated = await tx.revisions.update({
        data: { merged: true, mergedAt: new Date().toISOString() },
        where: { id: rev.id },
      });
      await createRevisionActivity(user, 'Revision.merged', updated, tx);
    });

    if (cantMerge) {
      res.status(400).send({
        cantMerge,
      });
      return;
    }

    res.status(200).send({
      data: {
        done: true,
      },
    });
  });

  done();
};

export default fn;
