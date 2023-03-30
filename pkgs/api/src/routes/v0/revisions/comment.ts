import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { schemaProseMirror } from '../../../common/validators';
import { db } from '../../../db';
import { getRevision } from '../../../middlewares/getRevision';
import { RevisionComment } from '../../../models/comment';
import { RevisionReview } from '../../../models/review';
import type {
  BlockLevelZero,
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
    const val = BodyVal().safeParse(req);
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

    const com = await db.transaction(async (transaction) => {
      const created = await RevisionComment.create(
        {
          ...where,
          content: data.content as BlockLevelZero,
        },
        { transaction }
      );

      if (data.approval) {
        await RevisionReview.destroy({ where, transaction });
        await RevisionReview.create(
          {
            ...where,
            commentId: created.id,
          },
          { transaction }
        );
        await rev.update(
          {
            status: 'approved',
          },
          { transaction }
        );
        await rev.onAfterApproved(req.user!, { transaction });
      } else {
        await rev.onAfterCommented(req.user!, { transaction });
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
