import type { Prisma, TypeHasUsers } from '@prisma/client';
import type { FastifyPluginCallback } from 'fastify';

import { validationError } from '../../../common/errors';
import { schemaRevision } from '../../../common/validators/revision';
import { prisma } from '../../../db';
import { getRevision } from '../../../middlewares/getRevision';
import { createRevisionActivity } from '../../../models/revision';
import type {
  ReqGetRevision,
  ReqPutRevision,
  ReqRevisionParams,
  ResPutRevision,
} from '../../../types/api';

function diffUsers(
  origin: TypeHasUsers[],
  newIds: string[],
  role: TypeHasUsers['role']
) {
  const oldIds: string[] = [];
  for (const user of origin) {
    if (user.role === role) oldIds.push(user.userId);
  }

  const toAdd = newIds.filter((x) => !oldIds.includes(x));
  const toRemove = oldIds.filter((x) => !newIds.includes(x));

  return { toAdd, toRemove };
}

function BodyVal() {
  // TODO: val ids
  return schemaRevision;
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.put<{
    Params: ReqRevisionParams;
    Querystring: ReqGetRevision;
    Body: ReqPutRevision;
    Reply: ResPutRevision;
  }>('/', { preHandler: getRevision }, async function (req, res) {
    const val = BodyVal().safeParse(req.body);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const data = val.data;
    const rev = req.revision!;
    const user = req.user!;

    // TODO: validation
    try {
      await prisma.$transaction(async (tx) => {
        const users = await tx.typeHasUsers.findMany({
          where: {
            revisionId: rev.id,
          },
        });

        // We diff to know which user to add or remove
        const diffAuthors = diffUsers(users, data.authors, 'author');
        const diffReviewers = diffUsers(users, data.reviewers, 'reviewer');

        // TODO: invalidate approval if we remove a reviewer that approved and they were the only one

        await Promise.all([
          ...diffAuthors.toAdd.map((userId) => {
            return tx.typeHasUsers.create({
              data: { revisionId: rev.id, userId, role: 'author' },
            });
          }),
          ...diffAuthors.toRemove.map((userId) => {
            return tx.typeHasUsers.delete({
              where: {
                revisionId_userId: {
                  revisionId: rev.id,
                  userId,
                },
              },
            });
          }),
          ...diffReviewers.toAdd.map((userId) => {
            return tx.typeHasUsers.create({
              data: { revisionId: rev.id, userId, role: 'reviewer' },
            });
          }),
          ...diffReviewers.toRemove.map((userId) => {
            return tx.typeHasUsers.delete({
              where: {
                revisionId_userId: {
                  revisionId: rev.id,
                  userId,
                },
              },
            });
          }),
        ]);

        const { authors, reviewers, ...body } = data;
        let action = 'update';
        const updates: Prisma.RevisionsUpdateInput = { ...body };

        // @ts-expect-error
        delete body.closedAt; // TODO: remove this after validation
        if (rev.closedAt && body.status !== 'closed') {
          // rev.set('closedAt', null);
          updates.closedAt = null;
        } else if (!rev.closedAt && body.status === 'closed') {
          updates.closedAt = new Date();
          action = 'closed';
        }

        if (!rev.locked && body.locked) {
          action = 'locked';
        }

        // rev.set(body as ApiRevision);
        // await rev.save({ transaction });
        await tx.revisions.update({ data: updates, where: { id: rev.id } });

        if (action === 'closed') {
          // await rev.onAfterClosed(req.user!, { transaction });
          await createRevisionActivity(user, 'Revision.closed', rev, tx);
        } else if (action === 'locked') {
          // await rev.onAfterLocked(req.user!, { transaction });
          await createRevisionActivity(user, 'Revision.locked', rev, tx);
        } else {
          // handled by default
        }
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
