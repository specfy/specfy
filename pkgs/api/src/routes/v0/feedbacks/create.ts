import { nanoid, schemaOrgId } from '@specfy/core';
import { prisma } from '@specfy/db';
import z from 'zod';

import type { PostFeedback } from '@specfy/models';

import { validationError } from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';
import { noQuery } from '../../../middlewares/noQuery.js';

import type { FastifyPluginCallback, FastifyRequest } from 'fastify';

function FeedbackVal(req: FastifyRequest) {
  return z
    .object({
      orgId: schemaOrgId,
      feedback: z.string().max(2000),
      referer: z.string().max(2000),
    })
    .strict()
    .superRefine(valPermissions(req, 'viewer'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post<PostFeedback>(
    '/',
    { preHandler: noQuery },
    async function (req, res) {
      const val = await FeedbackVal(req).safeParseAsync(req.body, {});
      if (!val.success) {
        return validationError(res, val.error);
      }

      const data: PostFeedback['Body'] = val.data;
      const me = req.me!;

      await prisma.feedbacks.create({
        data: {
          id: nanoid(),
          feedback: data.feedback,
          orgId: data.orgId,
          userId: me.id,
          referer: data.referer,
        },
      });

      return res.status(200).send({ data: { done: true } });
    }
  );
  done();
};

export default fn;
