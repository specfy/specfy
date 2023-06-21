import type { FastifyPluginCallback } from 'fastify';
import z from 'zod';

import { validationError } from '../../../common/errors';
import { toApiOrg } from '../../../common/formatters/org';
import { schemaOrgId } from '../../../common/validators';
import { prisma } from '../../../db';
import { noQuery } from '../../../middlewares/noQuery';
import { createOrg } from '../../../models';
import type { PostOrg } from '../../../types/api';

const OrgVal = z
  .object({
    id: schemaOrgId.superRefine(async (val, ctx) => {
      const res = await prisma.orgs.findUnique({ where: { id: val } });
      if (!res) {
        return;
      }

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        params: { code: 'exists' },
        message: 'This id is already used',
      });
    }),
    name: z.string().min(4).max(36),
  })
  .strict();

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<PostOrg>(
    '/',
    { preHandler: noQuery },
    async function (req, res) {
      const val = await OrgVal.safeParseAsync(req.body, {});
      if (!val.success) {
        return validationError(res, val.error);
      }

      const data = val.data;

      const org = await prisma.$transaction(async (tx) => {
        return createOrg(tx, req.user!, data);
      });

      res.status(200).send(toApiOrg(org));
    }
  );

  done();
};

export default fn;
