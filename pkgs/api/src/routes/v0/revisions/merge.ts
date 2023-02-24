import type { FastifyPluginCallback } from 'fastify';
import type { Model } from 'sequelize';
import { Transaction } from 'sequelize';

import { iterate } from '../../../common/blobs';
import { notFound } from '../../../common/errors';
import { db } from '../../../db';
import { Revision, RevisionBlob } from '../../../models';
import type {
  ReqGetRevision,
  ReqRevisionParams,
  ResMergeRevision,
  ResMergeRevisionError,
} from '../../../types/api';

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
      // TODO: check who can merge
      // TODO: check if we are up to date
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
          if (!prev) {
            cantMerge = 'not_up_to_date';
            throw new Error('cant merge');
          }
          await (prev as Model).update(
            { ...blob.blob, blobId: blob.id },
            { transaction }
          );
        },
        transaction
      );

      // Update revision
      await rev.update(
        {
          merged: true,
          mergedAt: new Date().toISOString(),
        },
        { transaction }
      );
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
