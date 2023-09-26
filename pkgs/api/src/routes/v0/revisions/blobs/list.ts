import { prisma } from '@specfy/db';
import { sortBlobsByInsertion } from '@specfy/models';

import type { ApiBlobWithPrevious, ListRevisionBlobs } from '@specfy/models';

import { getRevision } from '../../../../middlewares/getRevision.js';

import type { FastifyPluginCallback } from 'fastify';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<ListRevisionBlobs>(
    '/',
    { preHandler: getRevision },
    async function (req, res) {
      const rev = req.revision!;
      const list = await prisma.blobs.findMany({
        where: {
          id: { in: rev.blobs },
        },
        include: { Previous: true },
        orderBy: { createdAt: 'asc' },
      });

      if (list.length <= 0) {
        return res.status(200).send({ data: [] });
      }

      const sorted = sortBlobsByInsertion(rev.blobs, list) as typeof list;

      return res.status(200).send({
        data: sorted.map((blob) => {
          const ex: ApiBlobWithPrevious = {
            id: blob.id,
            parentId: blob.parentId,
            type: blob.type as any,
            typeId: blob.typeId,
            current: blob.current as any,
            previous: (blob.Previous?.current as any) || null,
            created: blob.created,
            deleted: blob.deleted,
            createdAt: blob.createdAt.toISOString(),
            updatedAt: blob.updatedAt.toISOString(),
          };
          return ex;
        }),
      });
    }
  );
  done();
};

export default fn;
