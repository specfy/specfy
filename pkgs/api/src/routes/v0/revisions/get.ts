import type { FastifyPluginCallback } from 'fastify';

import { toApiRevision } from '../../../common/formatters/revision';
import { toApiUser } from '../../../common/formatters/user';
import { getRevision } from '../../../middlewares/getRevision';
import { TypeHasUser } from '../../../models';
import type {
  ReqGetRevision,
  ReqRevisionParams,
  ResGetRevision,
} from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Params: ReqRevisionParams;
    Querystring: ReqGetRevision;
    Reply: ResGetRevision;
  }>('/', { preHandler: getRevision }, async function (req, res) {
    const rev = req.revision!;

    const users = await TypeHasUser.scope('withUser').findAll({
      where: {
        revisionId: rev.id,
      },
    });

    res.status(200).send({
      data: {
        ...toApiRevision(rev, users),
        reviewers: users
          .filter((user) => user.role === 'reviewer')
          .map((u) => toApiUser(u.user)),
      },
    });
  });

  done();
};

export default fn;
