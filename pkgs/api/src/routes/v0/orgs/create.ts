import type { FastifyPluginCallback } from 'fastify';
import z from 'zod';

import { validationError } from '../../../common/errors';
import { nanoid } from '../../../common/id';
import { schemaOrgId } from '../../../common/validators';
import { prisma } from '../../../db';
import { noQuery } from '../../../middlewares/noQuery';
import { createOrgActivity } from '../../../models';
import type { ReqPostOrg, ResPostOrg } from '../../../types/api';

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
  fastify.post<{
    Body: ReqPostOrg;
    Reply: ResPostOrg;
  }>('/', { preHandler: noQuery }, async function (req, res) {
    const val = await OrgVal.safeParseAsync(req.body, {});
    if (!val.success) {
      return validationError(res, val.error);
    }

    const data = val.data;

    const org = await prisma.$transaction(async (tx) => {
      const tmp = await tx.orgs.create({
        data: { id: data.id, name: data.name },
      });
      await createOrgActivity(req.user!, 'Org.created', tmp, tx);

      await tx.perms.create({
        data: {
          id: nanoid(),
          orgId: data.id,
          projectId: null,
          userId: req.user!.id,
          role: 'owner',
        },
      });

      return tmp;
    });

    res.status(200).send({
      id: org.id,
      name: org.name,
    });
  });

  done();
};

export default fn;
