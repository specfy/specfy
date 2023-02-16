import type { FastifyPluginCallback } from 'fastify';

import { Revision } from '../../../models';
import type {
  ReqPostRevision,
  ResPostRevision,
} from '../../../types/api/revisions';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{
    Body: ReqPostRevision;
    Reply: ResPostRevision;
  }>('/', async function (req, res) {
    // TODO: validation
    const p = await Revision.create({
      orgId: req.body.orgId,
      projectId: req.body.projectId,
      parentId: req.body.parentId,
      title: req.body.title,
      description: req.body.description,
      changes: req.body.changes,
    });

    res.status(200).send({
      id: p.id,
    });
  });

  done();
};

export default fn;
