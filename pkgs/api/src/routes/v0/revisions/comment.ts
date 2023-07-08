import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { nanoid } from '../../../common/id.js';
import { schemaProseMirror } from '../../../common/validators/index.js';
import { prisma } from '../../../db/index.js';
import { getRevision } from '../../../middlewares/getRevision.js';
import { createRevisionActivity } from '../../../models/index.js';
import type { CommentRevision } from '../../../types/api/index.js';

function BodyVal() {
  return z
    .object({
      content: schemaProseMirror,
      approval: z.boolean(),
    })
    .strict();
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post<CommentRevision>(
    '/',
    { preHandler: getRevision },
    async function (req, res) {
      const val = BodyVal().safeParse(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const data: CommentRevision['Body'] = val.data;
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
          data: {
            ...where,
            id: nanoid(),
            content: data.content,
          },
        });

        if (data.approval) {
          await tx.reviews.deleteMany({ where }); //TODO: not sure it's correct
          await tx.reviews.create({
            data: { ...where, id: nanoid(), commentId: created.id },
          });
          await tx.revisions.update({
            data: { status: 'approved' },
            where: { id: rev.id },
          });
          await createRevisionActivity({
            user: req.user!,
            action: 'Revision.approved',
            target: rev,
            tx,
          });
        } else {
          await createRevisionActivity({
            user: req.user!,
            action: 'Revision.commented',
            target: rev,
            tx,
          });
        }

        return created;
      });

      return res.status(200).send({
        data: {
          id: com.id,
        },
      });
    }
  );

  done();
};

export default fn;
