import { prisma } from '@specfy/db';
import { recomputeOrgGraph } from '@specfy/models';
import type { DeleteProject } from '@specfy/models';
import type { FastifyPluginCallback } from 'fastify';

import { getProject } from '../../../middlewares/getProject.js';
import { noBody } from '../../../middlewares/noBody.js';
import { noQuery } from '../../../middlewares/noQuery.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.delete<DeleteProject>(
    '/',
    { preHandler: [noQuery, noBody, getProject] },
    async function (req, res) {
      const project = req.project!;

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

      return res.status(204).send();
    }
  );
  done();
};

export default fn;
