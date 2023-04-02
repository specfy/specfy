import type { FastifyPluginCallback } from 'fastify';

import { findAllBlobsWithParent } from '../../../common/blobs';
import { toApiReview } from '../../../common/formatters/review';
import { checkReviews } from '../../../common/revision';
import { prisma } from '../../../db';
import { getRevision } from '../../../middlewares/getRevision';
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
  }>('/', { preHandler: getRevision }, async function (req, res) {
    const rev = req.revision!;
    const outdatedBlobs: string[] = [];

    const checks = await prisma.$transaction(async (tx) => {
      const list = await findAllBlobsWithParent(rev.blobs as string[], tx);
      for (const item of list) {
        // If we can't find the prev, that means it's not longer in the main branch
        if (!item.parent && item.blob.parentId) {
          outdatedBlobs.push(item.blob.id);
        }
      }

      // Check if we have reviews
      const reviews = await checkReviews(rev, tx);

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
