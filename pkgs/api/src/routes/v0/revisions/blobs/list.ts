import type { FastifyPluginCallback } from 'fastify';

import { prisma } from '../../../../db';
import { getRevision } from '../../../../middlewares/getRevision';
import type {
  ReqGetRevision,
  ReqRevisionParams,
  ApiBlobWithPrevious,
  ResListRevisionBlobsSuccess,
} from '../../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Params: ReqRevisionParams;
    Querystring: ReqGetRevision;
    Reply: ResListRevisionBlobsSuccess;
  }>('/', { preHandler: getRevision }, async function (req, res) {
    const rev = req.revision!;
    const list = await prisma.blobs.findMany({
      where: {
        id: { in: rev.blobs as string[] },
      },
      include: { Previous: true },
      orderBy: { createdAt: 'asc' },
      take: 100,
      skip: 0,
    });

    if (list.length <= 0) {
      res.status(200).send({ data: [] });
      return;
    }

    res.status(200).send({
      data: list.map((blob) => {
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
  });

  done();
};

export default fn;
