import type { FastifyPluginCallback } from 'fastify';
import { Transaction } from 'sequelize';

import { iterate } from '../../../common/blobs';
import { notFound } from '../../../common/errors';
import { db } from '../../../db';
import {
  Component,
  Document,
  Project,
  Revision,
  RevisionBlob,
  RevisionReview,
} from '../../../models';
import type {
  ReqGetRevision,
  ReqRevisionParams,
  ResRebaseRevision,
} from '../../../types/api/revisions';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{
    Params: ReqRevisionParams;
    Querystring: ReqGetRevision;
    Reply: ResRebaseRevision;
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

    try {
      await db.transaction(async (transaction) => {
        const list = await RevisionBlob.findAll({
          where: {
            id: rev.blobs,
          },
          order: [['createdAt', 'ASC']],
          limit: 100,
          offset: 0,
          lock: Transaction.LOCK.UPDATE,
          transaction,
        });

        await iterate(
          list,
          async (blob, prev) => {
            // If we can't find the prev, that means it's not longer in the main branch
            if (prev) {
              return;
            }

            if (blob.type === 'project') {
              const parent = await Project.findOne({
                where: { id: blob.typeId },
                transaction,
              });
              await blob.update({ parentId: parent!.blobId }, { transaction });
            } else if (blob.type === 'component') {
              const parent = await Component.findOne({
                where: { id: blob.typeId },
                transaction,
              });
              await blob.update({ parentId: parent!.blobId }, { transaction });
            } else if (blob.type === 'document') {
              const parent = await Document.findOne({
                where: { id: blob.typeId },
                transaction,
              });
              await blob.update({ parentId: parent!.blobId }, { transaction });
            }
          },
          transaction
        );

        // Destroy all previous reviews
        await RevisionReview.scope('withUser').destroy({
          where: {
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
      });
    } catch (e) {
      res.status(200).send({
        data: {
          done: false,
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
