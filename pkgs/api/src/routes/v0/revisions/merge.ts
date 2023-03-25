import type { FastifyPluginCallback } from 'fastify';
import type { Model } from 'sequelize';

import { findAllBlobsWithParent } from '../../../common/blobs';
import { notFound } from '../../../common/errors';
import { checkReviews } from '../../../common/revision';
import { db } from '../../../db';
import { Component, Project, Revision, Document } from '../../../models';
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
    Reply: ResMergeRevision | ResMergeRevisionError;
  }>('/', async function (req, res) {
    // Use /get
    const rev = await Revision.findOne({
      where: {
        // TODO validation
        orgId: req.query.org_id,
        projectId: req.query.project_id,
        id: req.params.revision_id,
      },
    });

    if (!rev) {
      return notFound(res);
    }

    let cantMerge: string | false = false;
    await db.transaction(async (transaction) => {
      // Check if we have reviews
      const reviews = await checkReviews(rev, transaction);
      if (!reviews.check) {
        cantMerge = 'missing_checks';
        throw new Error(cantMerge);
      }

      // TODO: check who can merge

      // Merge all blobs
      const list = await findAllBlobsWithParent(rev.blobs, transaction, true);
      for (const item of list) {
        // If we can't find the prev, that means it's not longer in the main branch
        if (!item.parent && item.blob.parentId) {
          cantMerge = 'not_up_to_date';
          throw new Error(cantMerge);
        }

        // Update a blob
        if (item.parent && !item.blob.deleted) {
          await (item.parent as Model).update(
            { ...item.blob.blob, blobId: item.blob.id },
            { transaction }
          );
          continue;
        }

        const blob = item.blob as unknown as DBBlob;
        if (blob.type === 'project') {
          if (blob.deleted) {
            await Project.destroy({ where: { id: blob.typeId }, transaction });
            continue;
          }

          await Project.create(
            { ...blob.blob!, blobId: blob.id },
            {
              transaction,
            }
          );
        } else if (blob.type === 'component') {
          if (item.blob.deleted) {
            await Component.destroy({
              where: { id: blob.typeId },
              transaction,
            });
            continue;
          }

          await Component.create(
            { ...blob.blob!, blobId: blob.id },
            {
              transaction,
            }
          );
        } else if (blob.type === 'document') {
          if (blob.deleted) {
            await Document.destroy({ where: { id: blob.typeId }, transaction });
            continue;
          }

          await Document.create(
            { ...blob.blob!, blobId: blob.id },
            {
              transaction,
            }
          );
        }
      }

      // Update revision
      await rev.update(
        {
          merged: true,
          mergedAt: new Date().toISOString(),
        },
        { transaction }
      );

      await rev.onAfterMerge(req.user!, { transaction });
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
