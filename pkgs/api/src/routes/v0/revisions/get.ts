import type { FastifyPluginCallback } from 'fastify';

import { toApiRevision } from '../../../common/formatters/revision';
import { toApiUser } from '../../../common/formatters/user';
import { prisma } from '../../../db';
import { getRevision } from '../../../middlewares/getRevision';
import type {
  ReqGetRevision,
  ReqRevisionParams,
  ResGetRevisionSuccess,
} from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Params: ReqRevisionParams;
    Querystring: ReqGetRevision;
    Reply: ResGetRevisionSuccess;
  }>('/', { preHandler: getRevision }, async function (req, res) {
    const rev = req.revision!;

    const users = await prisma.typeHasUsers.findMany({
      where: {
        revisionId: rev.id,
      },
      include: { User: true },
    });

    res.status(200).send({
      data: {
        ...toApiRevision(rev, users),
        reviewers: users
          .filter((user) => user.role === 'reviewer')
          .map((u) => toApiUser(u.User)),
      },
    });
  });

  done();
};

export default fn;
