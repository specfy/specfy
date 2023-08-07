import type { FastifyPluginCallback } from 'fastify';
import z from 'zod';

import { validationError } from '../../../common/errors.js';
import { schemaOrgId } from '../../../common/validators/index.js';
import { prisma } from '../../../db/index.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import { createOrg } from '../../../models/index.js';
import { forbiddenOrgName } from '../../../models/orgs/constants.js';
import { toApiOrgPublic } from '../../../models/orgs/formatter.js';
import type { PostOrg } from '../../../types/api/index.js';

const OrgVal = z
  .object({
    id: schemaOrgId.superRefine(async (val, ctx) => {
      if (forbiddenOrgName.includes(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          params: { code: 'invalid' },
          message: 'This id is not allowed',
        });
      }

      const res = await prisma.orgs.findUnique({ where: { id: val } });
      if (res) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          params: { code: 'exists' },
          message: 'This id is already used',
        });
      }
    }),
    name: z.string().min(4).max(36),
  })
  .strict();

const fn: FastifyPluginCallback = (fastify, _, done) => {
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
        return createOrg(tx, req.me!, data);
      });

      return res.status(200).send(toApiOrgPublic(org));
    }
  );
  done();
};

export default fn;
