import type { FastifyPluginCallback } from 'fastify';

import { findAllBlobsWithParent } from '../../../common/blobs';
import { notFound } from '../../../common/errors';
import { toApiReview } from '../../../common/formatters/review';
import { checkReviews } from '../../../common/revision';
import { db } from '../../../db';
import { Revision } from '../../../models';
import type {
  ReqGetRevision,
  ReqRevisionParams,
  ResCheckRevision,
} from '../../../types/api';

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
      const list = await findAllBlobsWithParent(rev.blobs, transaction);
      for (const item of list) {
        // If we can't find the prev, that means it's not longer in the main branch
        if (!item.parent && item.blob.parentId) {
          outdatedBlobs.push(item.blob.id);
        }
      }

      // Check if we have reviews
      const reviews = await checkReviews(rev, transaction);

      return { reviews };
    });

    const canMerge =
      rev.status === 'approved' &&
      checks.reviews.check &&
      outdatedBlobs.length === 0;

    res.status(200).send({
      data: {
        canMerge,
        outdatedBlobs,
        reviews: checks.reviews.list.map(toApiReview),
      },
    });
  });

  done();
};

export default fn;
