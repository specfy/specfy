import type { FastifyPluginCallback } from 'fastify';

import { notFound } from '../../../common/errors';
import { Revision } from '../../../models';
import type {
  ReqGetRevision,
  ResGetRevision,
} from '../../../types/api/revisions';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Querystring: ReqGetRevision;
    Reply: ResGetRevision;
  }>('/', async function (req, res) {
    const rev = await Revision.findOne({
      where: {
        // TODO validation
        orgId: req.query.org_id,
        projectId: req.query.project_id,
        id: req.query.id,
      },
    });

    if (!rev) {
      return notFound(res);
    }

    res.status(200).send({
      data: {
        id: rev.id,
        orgId: rev.orgId,
        projectId: rev.projectId,
        title: rev.title,
        description: rev.description,
        locked: rev.locked,
        merged: rev.merged,
        status: rev.status,
        blobs: rev.blobs,
        createdAt: rev.createdAt.toISOString(),
        updatedAt: rev.updatedAt.toISOString(),
      },
    });
  });

  done();
};

export default fn;
