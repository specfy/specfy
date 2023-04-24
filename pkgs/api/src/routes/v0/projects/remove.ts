import type { FastifyPluginCallback } from 'fastify';

import { prisma } from '../../../db';
import { getProject } from '../../../middlewares/getProject';
import { noBody } from '../../../middlewares/noBody';
import { noQuery } from '../../../middlewares/noQuery';
import type { ReqProjectParams, ResDeleteProject } from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.delete<{
    Params: ReqProjectParams;
    Reply: ResDeleteProject;
  }>(
    '/',
    { preHandler: [noQuery, noBody, getProject] },
    async function (req, res) {
      const project = req.project!;

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
        // await createProjectActivity(req.user!, 'Project.deleted', project, tx);
      });

      res.status(204).send();
    }
  );

  done();
};

export default fn;
