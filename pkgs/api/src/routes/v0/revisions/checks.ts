import type { FastifyPluginCallback } from 'fastify';
import { Transaction } from 'sequelize';

import { iterate } from '../../../common/blobs';
import { notFound } from '../../../common/errors';
import { toApiReview } from '../../../common/formatters/review';
import { db } from '../../../db';
import { Revision, RevisionBlob, RevisionReview } from '../../../models';
import type {
  ReqGetRevision,
  ReqRevisionParams,
  ResCheckRevision,
} from '../../../types/api/revisions';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Params: ReqRevisionParams;
    Querystring: ReqGetRevision;
    Reply: ResCheckRevision;
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
    const outdatedBlobs: string[] = [];

    const checks = await db.transaction(async (transaction) => {
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
          if (!prev) {
            outdatedBlobs.push(blob.id);
          }
        },
        transaction
      );

      // Check if we have reviews
      const reviews = await RevisionReview.scope('withUser').findAll({
        where: {
          orgId: req.query.org_id,
          projectId: req.query.project_id,
          revisionId: req.params.revision_id,
        },
        lock: Transaction.LOCK.UPDATE,
        transaction,
      });

      return { reviews };
    });

    const canMerge = checks.reviews.length > 0 && outdatedBlobs.length === 0;

    res.status(200).send({
      data: {
        canMerge,
        outdatedBlobs,
        reviews: checks.reviews.map(toApiReview),
      },
    });
  });

  done();
};

export default fn;
