import { prisma } from '@specfy/db';
import { findAllBlobsWithParent, createRevisionActivity } from '@specfy/models';

import type { RebaseRevision } from '@specfy/models';

import { getRevision } from '../../../middlewares/getRevision.js';
import { noBody } from '../../../middlewares/noBody.js';

import type { FastifyPluginCallback } from 'fastify';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post<RebaseRevision>(
    '/',
    { preHandler: [noBody, getRevision] },
    async function (req, res) {
      const rev = req.revision!;

      await prisma.$transaction(async (tx) => {
        const list = await findAllBlobsWithParent(rev.blobs, tx);

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
            const parent = await tx.projects.findUnique({
              where: { id: item.blob.typeId },
            });
            await tx.blobs.update({
              data: { parentId: parent!.blobId },
              where: { id: item.blob.id },
            });
          } else if (item.blob.type === 'component') {
            const parent = await tx.components.findUnique({
              where: { id: item.blob.typeId },
            });
            await tx.blobs.update({
              data: { parentId: parent!.blobId },
              where: { id: item.blob.id },
            });
          } else if (item.blob.type === 'document') {
            const parent = await tx.documents.findUnique({
              where: { id: item.blob.typeId },
            });
            await tx.blobs.update({
              data: { parentId: parent!.blobId },
              where: { id: item.blob.id },
            });
          }
        }

        // Destroy all previous reviews
        await tx.reviews.deleteMany({
          where: {
            orgId: rev.orgId,
            projectId: rev.projectId,
            revisionId: rev.id,
          },
        });

        await tx.revisions.update({
          data: {
            status: rev.status === 'draft' ? 'draft' : 'waiting',
            updatedAt: new Date(),
          },
          where: {
            id: rev.id,
          },
        });

        // await rev.onAfterRebased(req.me!, { transaction });
        await createRevisionActivity({
          user: req.me!,
          action: 'Revision.rebased',
          target: rev,
          tx,
        });
      });

      return res.status(200).send({
        data: {
          done: true,
        },
      });
    }
  );
  done();
};

export default fn;
