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
    const p = await Revision.findOne({
      where: {
        // TODO validation
        orgId: req.query.org_id,
        projectId: req.query.project_id,
        id: req.query.id,
      },
    });

    if (!p) {
      return notFound(res);
    }

    res.status(200).send({
      data: {
        id: p.id,
        orgId: p.orgId,
        projectId: p.projectId,
        parentId: p.parentId,
        title: p.title,
        description: p.description,
        changes: p.changes,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      },
    });
  });

  done();
};

export default fn;
