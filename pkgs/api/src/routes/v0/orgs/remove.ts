import type { FastifyPluginCallback } from 'fastify';

import { prisma } from '../../../db/index.js';
import { getOrg } from '../../../middlewares/getOrg.js';
import { noBody } from '../../../middlewares/noBody.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import type { DeleteOrg } from '../../../types/api/index.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.delete<DeleteOrg>(
    '/',
    { preHandler: [noQuery, noBody, getOrg] },
    async function (req, res) {
      const org = req.org!;

      if (org.isPersonal) {
        // Can't delete own org
        res.status(400).send({
          error: {
            code: 'cant_delete',
            reason: 'is_personal',
          },
        });
        return;
      }

      await prisma.$transaction(async (tx) => {
        await tx.activities.deleteMany({ where: { orgId: org.id } });
        await tx.comments.deleteMany({ where: { orgId: org.id } });
        await tx.components.deleteMany({ where: { orgId: org.id } });
        await tx.documents.deleteMany({ where: { orgId: org.id } });
        await tx.perms.deleteMany({ where: { orgId: org.id } });
        await tx.reviews.deleteMany({ where: { orgId: org.id } });
        await tx.revisions.deleteMany({ where: { orgId: org.id } });
        await tx.projects.deleteMany({ where: { orgId: org.id } });
        await tx.orgs.delete({ where: { id: org.id } });
      });

      res.status(204).send();
    }
  );

  done();
};

export default fn;
