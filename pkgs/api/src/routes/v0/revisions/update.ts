import type { FastifyPluginCallback } from 'fastify';

import { notFound } from '../../../common/errors';
import { db } from '../../../db';
import { Revision, TypeHasUser } from '../../../models';
import type {
  ReqGetRevision,
  ReqPutRevision,
  ReqRevisionParams,
  ResPutRevision,
} from '../../../types/api';

function diffUsers(
  origin: TypeHasUser[],
  newIds: string[],
  role: TypeHasUser['role']
) {
  const oldIds: string[] = [];
  for (const user of origin) {
    if (user.role === role) oldIds.push(user.userId);
  }

  const toAdd = newIds.filter((x) => !oldIds.includes(x));
  const toRemove = oldIds.filter((x) => !newIds.includes(x));

  return { toAdd, toRemove };
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.put<{
    Params: ReqRevisionParams;
    Querystring: ReqGetRevision;
    Body: ReqPutRevision;
    Reply: ResPutRevision;
  }>('/', async function (req, res) {
    // TODO: reuse GET
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

    // TODO: validation
    try {
      await db.transaction(async (transaction) => {
        const users = await TypeHasUser.findAll({
          where: {
            revisionId: rev.id,
          },
        });

        // We diff to know which user to add or remove
        const diffAuthors = diffUsers(users, req.body.authors, 'author');
        const diffReviewers = diffUsers(users, req.body.reviewers, 'reviewer');

        // TODO: invalidate approval if we remove a reviewer that approved and they were the only one

        await Promise.all([
          ...diffAuthors.toAdd.map((userId) => {
            return TypeHasUser.create(
              {
                revisionId: rev.id,
                userId,
                role: 'author',
              },
              { transaction }
            );
          }),
          ...diffAuthors.toRemove.map((userId) => {
            return TypeHasUser.destroy({
              where: {
                revisionId: rev.id,
                userId,
              },
              transaction,
            });
          }),
          ...diffReviewers.toAdd.map((userId) => {
            return TypeHasUser.create(
              {
                revisionId: rev.id,
                userId,
                role: 'reviewer',
              },
              { transaction }
            );
          }),
          ...diffReviewers.toRemove.map((userId) => {
            return TypeHasUser.destroy({
              where: {
                revisionId: rev.id,
                userId,
              },
              transaction,
            });
          }),
        ]);

        const { authors, reviewers, ...body } = req.body;
        // @ts-expect-error
        delete body.closedAt; // TODO: remove this after validation
        if (rev.closedAt && body.status !== 'closed') {
          rev.set('closedAt', null);
        } else if (!rev.closedAt && body.status === 'closed') {
          rev.closedAt = new Date();
        }

        rev.set(body);
        await rev.save({ transaction });
      });
    } catch (e) {
      res.status(500).send({
        data: {
          done: false,
        },
      });
      return;
    }

    res.status(200).send({
      data: {
        done: true,
      },
    });
  });

  done();
};

export default fn;
