import type { FastifyPluginCallback } from 'fastify';

import { findAllBlobsWithParent } from '../../../common/blobs';
import { db } from '../../../db';
import { getRevision } from '../../../middlewares/getRevision';
import { Component, Document, Project, RevisionReview } from '../../../models';
import type {
  ReqGetRevision,
  ReqRevisionParams,
  ResRebaseRevision,
} from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{
    Params: ReqRevisionParams;
    Querystring: ReqGetRevision;
    Reply: ResRebaseRevision;
  }>('/', { preHandler: getRevision }, async function (req, res) {
    const rev = req.revision!;

    await db.transaction(async (transaction) => {
      const list = await findAllBlobsWithParent(rev.blobs, transaction);
      for (const item of list) {
        // If we can find the prev that means it's up to date
        if (item.parent) {
          continue;
        }

        // if there is no parent it's a brand new blob
        if (!item.blob.parentId) {
          continue;
        }

        // changes all parents id
        if (item.blob.type === 'project') {
          const parent = await Project.findOne({
            where: { id: item.blob.typeId },
            transaction,
          });
          await item.blob.update({ parentId: parent!.blobId }, { transaction });
        } else if (item.blob.type === 'component') {
          const parent = await Component.findOne({
            where: { id: item.blob.typeId },
            transaction,
          });
          await item.blob.update({ parentId: parent!.blobId }, { transaction });
        } else if (item.blob.type === 'document') {
          const parent = await Document.findOne({
            where: { id: item.blob.typeId },
            transaction,
          });
          await item.blob.update({ parentId: parent!.blobId }, { transaction });
        }
      }

      // Destroy all previous reviews
      await RevisionReview.scope('withUser').destroy({
        where: {
          // Use validated
          orgId: req.query.org_id,
          projectId: req.query.project_id,
          revisionId: req.params.revision_id,
        },
        transaction,
      });

      rev.changed('updatedAt', true);
      await rev.update(
        {
          status: rev.status === 'draft' ? 'draft' : 'waiting',
          updatedAt: new Date().toISOString(),
        },
        { transaction }
      );

      await rev.onAfterRebased(req.user!, { transaction });
    });

    res.status(200).send({
      data: {
        done: true,
      },
    });
  });

  done();
};

export default fn;
