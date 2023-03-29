import type { FastifyPluginCallback } from 'fastify';
import z from 'zod';

import { validationError } from '../../../common/errors';
import { db } from '../../../db';
import { Org, Perm } from '../../../models';
import type { ReqPostOrg, ResPostOrg } from '../../../types/api';

const OrgVal = z
  .object({
    id: z
      .string()
      .min(4)
      .max(36)
      .regex(/^[a-z][a-z0-9-]+[a-z]$/, {
        message: 'Should be lowercase and starts/ends with a letter',
      })
      .superRefine(async (val, ctx) => {
        const res = await Org.findOne({ where: { id: val } });
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
  }>('/', async function (req, res) {
    const val = await OrgVal.safeParseAsync(req.body, {});
    if (!val.success) {
      return validationError(res, val.error);
    }

    const data = val.data;

    const org = await db.transaction(async (transaction) => {
      const tmp = await Org.create(
        {
          id: data.id,
          name: data.name,
        },
        { transaction }
      );
      await tmp.onAfterCreate(req.user!, { transaction });

      await Perm.create(
        {
          orgId: data.id,
          projectId: null,
          userId: req.user!.id,
          role: 'owner',
        },
        { transaction }
      );

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
