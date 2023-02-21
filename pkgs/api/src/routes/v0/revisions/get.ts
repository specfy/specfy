import type { FastifyPluginCallback } from 'fastify';

import { notFound } from '../../../common/errors';
import { toApiUser } from '../../../common/formatters/user';
import { Revision, TypeHasUser } from '../../../models';
import type {
  ReqGetRevision,
  ReqRevisionParams,
  ResGetRevision,
} from '../../../types/api/revisions';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Params: ReqRevisionParams;
    Querystring: ReqGetRevision;
    Reply: ResGetRevision;
  }>('/', async function (req, res) {
    const rev = await Revision.findOne({
      where: {
        // TODO validation
        orgId: req.query.org_id,
        projectId: req.query.project_id,
        id: req.params.revision_id,
      },
    });

    if (!rev) {
      return notFound(res);
    }

    const users = await TypeHasUser.scope('withUser').findAll({
      where: {
        revisionId: rev.id,
      },
    });

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
        authors: users
          .filter((user) => user.role === 'author')
          .map((u) => toApiUser(u.user)),
        reviewers: users
          .filter((user) => user.role === 'reviewer')
          .map((u) => toApiUser(u.user)),
        createdAt: rev.createdAt.toISOString(),
        updatedAt: rev.updatedAt.toISOString(),
        mergedAt: rev.mergedAt?.toISOString(),
        closedAt: rev.closedAt?.toISOString(),
      },
    });
  });

  done();
};

export default fn;
