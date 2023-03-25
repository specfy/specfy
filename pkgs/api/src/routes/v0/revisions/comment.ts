import type { FastifyPluginCallback } from 'fastify';

import { notFound } from '../../../common/errors';
import { db } from '../../../db';
import { Revision } from '../../../models';
import { RevisionComment } from '../../../models/comment';
import { RevisionReview } from '../../../models/review';
import type {
  ReqGetRevision,
  ReqPostCommentRevision,
  ReqRevisionParams,
  ResPostCommentRevision,
} from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{
    Params: ReqRevisionParams;
    Querystring: ReqGetRevision;
    Body: ReqPostCommentRevision;
    Reply: ResPostCommentRevision;
  }>('/', async function (req, res) {
    // Use /get
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

    const where = {
      orgId: req.query.org_id,
      projectId: req.query.project_id,
      revisionId: req.params.revision_id,
      userId: req.user!.id,
    };

    const com = await db.transaction(async (transaction) => {
      const created = await RevisionComment.create(
        {
          ...where,
          content: req.body.content,
        },
        { transaction }
      );

      if (req.body.approval) {
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
