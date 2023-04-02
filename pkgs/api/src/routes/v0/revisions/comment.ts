import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { schemaProseMirror } from '../../../common/validators';
import { prisma } from '../../../db';
import { getRevision } from '../../../middlewares/getRevision';
import { createRevisionActivity } from '../../../models/revision';
import type {
  ReqGetRevision,
  ReqPostCommentRevision,
  ReqRevisionParams,
  ResPostCommentRevision,
} from '../../../types/api';

function BodyVal() {
  return z
    .object({
      content: schemaProseMirror,
      approval: z.boolean(),
    })
    .strict();
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{
    Params: ReqRevisionParams;
    Querystring: ReqGetRevision;
    Body: ReqPostCommentRevision;
    Reply: ResPostCommentRevision;
  }>('/', { preHandler: getRevision }, async function (req, res) {
    const val = BodyVal().safeParse(req.body);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const data = val.data;
    const rev = req.revision!;

    // TODO: reuse validation
    const where = {
      orgId: rev.orgId,
      projectId: rev.projectId,
      revisionId: rev.id,
      userId: req.user!.id,
    };

    const com = await prisma.$transaction(async (tx) => {
      const created = await tx.comments.create({
        data: { ...where, content: data.content as any },
      });

      if (data.approval) {
        await tx.reviews.deleteMany({ where }); //TODO: not sure it's correct
        await tx.reviews.create({
          data: { ...where, commentId: created.id },
        });
        await tx.revisions.update({
          data: { status: 'approved' },
          where: { id: rev.id },
        });
        await createRevisionActivity(req.user!, 'Revision.approved', rev, tx);
      } else {
        await createRevisionActivity(req.user!, 'Revision.commented', rev, tx);
      }

      return created;
    });

    res.status(200).send({
      data: {
        id: com.id,
      },
    });
  });

  done();
};

export default fn;
