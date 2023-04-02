import type { FastifyPluginCallback } from 'fastify';

import { prisma } from '../../../db';
import { getProject } from '../../../middlewares/getProject';
import { createProjectActivity } from '../../../models/project';
import type { ReqProjectParams } from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.delete<{
    Params: ReqProjectParams;
  }>('/', { preHandler: getProject }, async function (req, res) {
    const project = req.project!;

    await prisma.$transaction(async (tx) => {
      await tx.projects.delete({ where: { id: project.id } });
      await createProjectActivity(req.user!, 'Project.deleted', project, tx);
    });

    res.status(204).send();
  });

  done();
};

export default fn;
