import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';

import { acronymize, stringToColor } from '../../../common/avatar.js';
import { validationError } from '../../../common/errors.js';
import { schemaOrg } from '../../../common/validators/org.js';
import { prisma } from '../../../db/index.js';
import { getOrg } from '../../../middlewares/getOrg.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import { createOrgActivity } from '../../../models/index.js';
import { toApiOrg } from '../../../models/org/formatter.js';
import type { PutOrg } from '../../../types/api/index.js';

function BodyVal() {
  return z
    .object({
      name: schemaOrg.shape.name,
      // TODO: allow id modification
    })
    .strict();
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.put<PutOrg>(
    '/',
    { preHandler: [noQuery, getOrg] },
    async function (req, res) {
      const val = await BodyVal().safeParseAsync(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const data = val.data;
      let org = req.org!;

      if (data.name && org.name !== data.name) {
        org = await prisma.$transaction(async (tx) => {
          const acronym = acronymize(data.name);
          const colors = stringToColor(data.name);
          const tmp = await tx.orgs.update({
            data: { name: data.name, acronym, color: colors.backgroundColor },
            where: { id: org.id },
          });
          await createOrgActivity({
            user: req.user!,
            action: 'Org.renamed',
            target: tmp,
            tx,
          });

          return tmp;
        });
      }

      return res.status(200).send({
        data: toApiOrg(org),
      });
    }
  );
  done();
};

export default fn;
