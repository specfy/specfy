import { logEvent, schemaOrgId } from '@specfy/core';
import { prisma } from '@specfy/db';
import {
  createFreeSubscription,
  createOrg,
  forbiddenOrgName,
  toApiOrgPublic,
} from '@specfy/models';
import type { PostOrg } from '@specfy/models';
import type { FastifyPluginCallback } from 'fastify';
import z from 'zod';

import { validationError } from '../../../common/errors.js';
import { noQuery } from '../../../middlewares/noQuery.js';

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
      const me = req.me!;

      const org = await prisma.$transaction(async (tx) => {
        return createOrg(tx, me, data);
      });

      await createFreeSubscription({ org, me });

      logEvent('orgs.created', { orgId: org.id });

      return res.status(200).send({ data: toApiOrgPublic(org) });
    }
  );
  done();
};

export default fn;
