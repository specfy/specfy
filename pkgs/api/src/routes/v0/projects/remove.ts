import { prisma } from '@specfy/db';
import { logEvent } from '@specfy/events';
import {
  recomputeOrgGraph,
  removeTechByProject,
  removeUserActivitiesByProject,
} from '@specfy/models';

import type { DeleteProject } from '@specfy/models';

import { getProject } from '../../../middlewares/getProject.js';
import { noBody } from '../../../middlewares/noBody.js';

import type { FastifyPluginCallback } from 'fastify';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.delete<DeleteProject>(
    '/',
    { preHandler: [noBody, getProject] },
    async function (req, res) {
      const project = req.project!;
      const me = req.me!;

      // TODO: delete all edges to this project in each Project
      // TODO: delete all edges to this project in each components
      await prisma.$transaction(async (tx) => {
        await tx.activities.deleteMany({ where: { projectId: project.id } });
        await tx.comments.deleteMany({ where: { projectId: project.id } });
        await tx.components.deleteMany({ where: { projectId: project.id } });
        await tx.documents.deleteMany({ where: { projectId: project.id } });
        await tx.perms.deleteMany({ where: { projectId: project.id } });
        await tx.reviews.deleteMany({ where: { projectId: project.id } });
        await tx.revisions.deleteMany({ where: { projectId: project.id } });

        await tx.projects.delete({ where: { id: project.id } });
        // await tx.blobs.deleteMany({ where: { projectId: project.id } });
        // await createProjectActivity(req.me!, 'Project.deleted', project, tx);

        await recomputeOrgGraph({ orgId: project.orgId, tx });
      });

      await Promise.all([
        removeUserActivitiesByProject({ project }),
        removeTechByProject({ project }),
      ]);

      logEvent('projects.deleted', {
        userId: me.id,
        orgId: project.orgId,
        projectId: project.id,
      });

      return res.status(204).send();
    }
  );
  done();
};

export default fn;
