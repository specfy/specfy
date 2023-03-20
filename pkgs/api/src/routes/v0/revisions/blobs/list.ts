import type { FastifyPluginCallback } from 'fastify';

import { notFound } from '../../../../common/errors';
import { Revision, RevisionBlob } from '../../../../models';
import type {
  ReqGetRevision,
  ReqRevisionParams,
  ApiBlobWithPrevious,
  ResListRevisionBlobs,
} from '../../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Params: ReqRevisionParams;
    Querystring: ReqGetRevision;
    Reply: ResListRevisionBlobs;
  }>('/', async function (req, res) {
    // TODO: reuse this call from get
    const rev = await Revision.findOne({
      where: {
        orgId: req.query.org_id,
        projectId: req.query.project_id,
        id: req.params.revision_id,
      },
    });

    if (!rev) {
      return notFound(res);
    }

    const list = await RevisionBlob.scope('withPrevious').findAll({
      where: {
        id: rev.blobs,
      },
      order: [['createdAt', 'ASC']],
      limit: 100,
      offset: 0,
    });

    if (list.length <= 0) {
      res.status(200).send({ data: [] });
      return;
    }

    res.status(200).send({
      data: list.map((blob) => {
        const ex: ApiBlobWithPrevious = {
          id: blob.id,
          orgId: blob.orgId,
          projectId: blob.projectId,
          parentId: blob.parentId,
          type: blob.type as any,
          typeId: blob.typeId,
          blob: blob.blob as any,
          previous: blob.previousBlob?.blob || null,
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
