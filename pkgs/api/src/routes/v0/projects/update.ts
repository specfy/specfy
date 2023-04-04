import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { toApiProject } from '../../../common/formatters/project';
import { schemaProject } from '../../../common/validators';
import { prisma } from '../../../db';
import { getProject } from '../../../middlewares/getProject';
import { noQuery } from '../../../middlewares/noQuery';
import { createProjectActivity } from '../../../models/project';
import type {
  ReqProjectParams,
  ReqUpdateProject,
  ResUpdateProject,
} from '../../../types/api';

function BodyVal() {
  return z
    .object({
      name: schemaProject.shape.name,
      // TODO: allow slug modification
    })
    .strict();
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.put<{
    Params: ReqProjectParams;
    Body: ReqUpdateProject;
    Reply: ResUpdateProject;
  }>('/', { preHandler: [noQuery, getProject] }, async function (req, res) {
    const val = BodyVal().safeParse(req.body);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const data = val.data;
    let project = req.project!;

    if (data.name) {
      project = await prisma.$transaction(async (tx) => {
        const proj = await tx.projects.update({
          data: { name: data.name },
          where: { id: project.id },
        });
        await createProjectActivity(req.user!, 'Project.updated', proj, tx);

        return proj;
      });
    }

    res.status(200).send({
      data: toApiProject(project),
    });
  });

  done();
};

export default fn;
