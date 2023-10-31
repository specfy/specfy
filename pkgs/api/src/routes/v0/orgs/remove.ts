import { logEvent } from '@specfy/core';
import { prisma } from '@specfy/db';
import {
  removeTechByOrg,
  type DeleteOrg,
  removeUserActivitiesByOrg,
} from '@specfy/models';

import { getOrg } from '../../../middlewares/getOrg.js';
import { noBody } from '../../../middlewares/noBody.js';
import { noQuery } from '../../../middlewares/noQuery.js';

import type { FastifyPluginCallback } from 'fastify';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.delete<DeleteOrg>(
    '/',
    { preHandler: [noQuery, noBody, getOrg] },
    async function (req, res) {
      const org = req.org!;
      const me = req.me!;

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

      await Promise.all([
        removeUserActivitiesByOrg({ org }),
        removeTechByOrg({ org }),
      ]);

      logEvent('orgs.deleted', { userId: me.id, orgId: org.id });

      return res.status(204).send();
    }
  );
  done();
};

export default fn;
