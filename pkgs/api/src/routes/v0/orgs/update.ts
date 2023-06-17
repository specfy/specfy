import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';

import { acronymize, stringToColor } from '../../../common/avatar';
import { validationError } from '../../../common/errors';
import { toApiOrg } from '../../../common/formatters/org';
import { schemaOrg } from '../../../common/validators/org';
import { prisma } from '../../../db';
import { getOrg } from '../../../middlewares/getOrg';
import { noQuery } from '../../../middlewares/noQuery';
import { createOrgActivity } from '../../../models';
import type {
  ReqOrgParams,
  ReqPutOrg,
  ResPutOrgSuccess,
} from '../../../types/api';

function BodyVal() {
  return z
    .object({
      name: schemaOrg.shape.name,
      // TODO: allow id modification
    })
    .strict();
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.put<{
    Params: ReqOrgParams;
    Body: ReqPutOrg;
    Reply: ResPutOrgSuccess;
  }>('/', { preHandler: [noQuery, getOrg] }, async function (req, res) {
    const val = await BodyVal().safeParseAsync(req.body);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const data = val.data;
    let org = req.org!;

    if (data.name) {
      org = await prisma.$transaction(async (tx) => {
        const acronym = acronymize(data.name);
        const colors = stringToColor(data.name);
        const tmp = await tx.orgs.update({
          data: { name: data.name, acronym, color: colors.backgroundColor },
          where: { id: org.id },
        });
        await createOrgActivity(req.user!, 'Org.updated', tmp, tx);

        return tmp;
      });
    }

    res.status(200).send({
      data: toApiOrg(org),
    });
  });

  done();
};

export default fn;
