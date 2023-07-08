import type { Prisma, TypeHasUsers } from '@prisma/client';
import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { schemaRevision } from '../../../common/validators/revision.js';
import { prisma } from '../../../db/index.js';
import { getRevision } from '../../../middlewares/getRevision.js';
import { createRevisionActivity } from '../../../models/index.js';
import type { PatchRevision } from '../../../types/api/index.js';

function diffUsers(
  origin: TypeHasUsers[],
  newIds: string[],
  role: TypeHasUsers['role']
) {
  const oldIds: string[] = [];
  for (const user of origin) {
    if (user.role === role) {
      oldIds.push(user.userId);
    }
  }

  const toAdd = newIds.filter((x) => !oldIds.includes(x));
  const toRemove = oldIds.filter((x) => !newIds.includes(x));

  return { toAdd, toRemove };
}

function BodyVal() {
  // TODO: val ids
  return schemaRevision
    .pick({
      name: true,
      description: true,
      authors: true,
      reviewers: true,
      status: true,
      locked: true,
    })
    .partial()
    .superRefine((val, ctx) => {
      if ((val.authors && !val.reviewers) || (val.reviewers && !val.authors)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          params: { code: 'presence' },
          message: 'Authors and Reviewers should be submitted together',
        });
      }
      if (val.status && Object.keys(val).length > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          params: { code: 'presence' },
          message: "Status can't be changed with other fields",
          path: ['status'],
        });
      }
      if (val.locked && Object.keys(val).length > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          params: { code: 'presence' },
          message: "Locked can't be changed with other fields",
          path: ['locked'],
        });
      }
      if (val.authors && val.reviewers) {
        const exists = val.authors.filter((id) =>
          val.reviewers!.find((rid) => rid === id)
        );
        if (exists.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            params: { code: 'presence' },
            message: "Authors can't be Reviewers too",
            path: ['authors'],
          });
        }
      }
    });
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.patch<PatchRevision>(
    '/',
    { preHandler: getRevision },
    async function (req, res) {
      const val = BodyVal().safeParse(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const data: PatchRevision['Body'] = val.data;
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

          if (data.authors && data.reviewers) {
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
          }

          const { authors, reviewers, ...body } = data;
          let action = 'update';
          const updates: Prisma.RevisionsUpdateInput = {};

          if (body.name) {
            updates.name = body.name;
          }
          if (body.description) {
            updates.description = body.description;
          }
          if (typeof body.locked === 'boolean') {
            updates.locked = body.locked;
          }
          if (body.status) {
            updates.status = body.status;
          }

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

          await tx.revisions.update({ data: updates, where: { id: rev.id } });

          if (action === 'closed') {
            // await rev.onAfterClosed(req.user!, { transaction });
            await createRevisionActivity({
              user,
              action: 'Revision.closed',
              target: rev,
              tx,
            });
          } else if (action === 'locked') {
            // await rev.onAfterLocked(req.user!, { transaction });
            await createRevisionActivity({
              user,
              action: 'Revision.locked',
              target: rev,
              tx,
            });
          } else {
            await createRevisionActivity({
              user,
              action: 'Revision.updated',
              target: rev,
              tx,
            });
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

      return res.status(200).send({
        data: { done: true },
      });
    }
  );
  done();
};

export default fn;
