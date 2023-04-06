import type { Prisma } from '@prisma/client';
import type { FastifyPluginCallback } from 'fastify';

import { findAllBlobsWithParent } from '../../../common/blobs';
import { checkReviews } from '../../../common/revision';
import { prisma } from '../../../db';
import { getRevision } from '../../../middlewares/getRevision';
import { noBody } from '../../../middlewares/noBody';
import {
  createComponentActivity,
  createDocumentActivity,
  createProjectActivity,
  createRevisionActivity,
} from '../../../models';
import type {
  ReqGetRevision,
  ReqRevisionParams,
  ResMergeRevision,
  ResMergeRevisionError,
} from '../../../types/api';
import type { DBBlob } from '../../../types/db';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{
    Params: ReqRevisionParams;
    Querystring: ReqGetRevision;
    Reply: ResMergeRevision;
  }>('/', { preHandler: [noBody, getRevision] }, async function (req, res) {
    const rev = req.revision!;
    let reason: ResMergeRevisionError['error']['reason'] | false = false;
    const user = req.user!;

    await prisma.$transaction(async (tx) => {
      // Check if we have reviews
      const reviews = await checkReviews(rev, tx);
      if (!reviews.check || rev.status !== 'approved') {
        reason = 'no_reviews';
        return;
      }

      if (rev.merged) {
        reason = 'already_merged';
        return;
      }

      if ((rev.blobs as string[]).length === 0) {
        reason = 'empty';
        return;
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
          reason = 'outdated';
          return;
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
              data: { ...(item.blob.current as any), blobId: item.blob.id },
              where: { id: blob.typeId },
            });
            await createProjectActivity(user, 'Project.updated', up, tx);
            continue;
          }

          const created = await tx.projects.create({
            data: {
              ...(blob.current! as unknown as Prisma.ProjectsUncheckedCreateInput),
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
              data: { ...(item.blob.current as any), blobId: item.blob.id },
              where: { id: blob.typeId },
            });
            await createComponentActivity(user, 'Component.updated', up, tx);
            continue;
          }

          const created = await tx.components.create({
            data: {
              ...(blob.current! as unknown as Prisma.ComponentsUncheckedCreateInput),
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
              data: { ...(item.blob.current as any), blobId: item.blob.id },
              where: { id: blob.typeId },
            });
            await createDocumentActivity(user, 'Document.updated', up, tx);
            continue;
          }

          const created = await tx.documents.create({
            data: {
              ...(blob.current! as unknown as Prisma.DocumentsUncheckedCreateInput),
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

    if (reason) {
      res.status(400).send({
        error: {
          code: 'cant_merge',
          reason,
        },
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
