import { acronymize, stringToColor } from '@specfy/core';
import { prisma } from '@specfy/db';
import { createOrgActivity, toApiOrgPublic, schemaOrg } from '@specfy/models';
import type { PutOrg } from '@specfy/models';
import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { getOrg } from '../../../middlewares/getOrg.js';
import { noQuery } from '../../../middlewares/noQuery.js';

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
            user: req.me!,
            action: 'Org.renamed',
            target: tmp,
            tx,
          });

          return tmp;
        });
      }

      return res.status(200).send({
        data: toApiOrgPublic(org),
      });
    }
  );
  done();
};

export default fn;
