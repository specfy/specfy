import type { FastifyPluginCallback } from 'fastify';

import { findAllBlobsWithParent } from '../../../common/blobs.js';
import { toApiReview } from '../../../common/formatters/review.js';
import { checkReviews } from '../../../common/revision/index.js';
import { prisma } from '../../../db/index.js';
import { getRevision } from '../../../middlewares/getRevision.js';
import { flagRevisionApprovalEnabled } from '../../../models/revisions/constants.js';
import type { ListRevisionChecks } from '../../../types/api/index.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<ListRevisionChecks>(
    '/',
    { preHandler: getRevision },
    async function (req, res) {
      const rev = req.revision!;
      const outdatedBlobs: string[] = [];

      const checks = await prisma.$transaction(async (tx) => {
        const list = await findAllBlobsWithParent(rev.blobs, tx);
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
        (flagRevisionApprovalEnabled
          ? rev.status === 'approved' && checks.reviews.check
          : rev.status === 'waiting' || rev.status === 'approved') &&
        outdatedBlobs.length === 0;

      return res.status(200).send({
        data: {
          canMerge,
          outdatedBlobs,
          reviews: checks.reviews.list.map(toApiReview),
        },
      });
    }
  );
  done();
};

export default fn;
