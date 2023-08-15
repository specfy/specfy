import { prisma } from '@specfy/db';
import {
  findAllBlobsWithParent,
  toApiReview,
  checkReviews,
  flagRevisionApprovalEnabled,
} from '@specfy/models';
import type { ListRevisionChecks } from '@specfy/models';
import type { FastifyPluginCallback } from 'fastify';

import { getRevision } from '../../../middlewares/getRevision.js';

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
