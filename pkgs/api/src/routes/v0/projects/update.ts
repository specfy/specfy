import type { FastifyPluginCallback } from 'fastify';

import { toApiProject } from '../../../common/formatters/project';
import { db } from '../../../db';
import { getProject } from '../../../middlewares/getProject';
import type {
  ReqProjectParams,
  ReqUpdateProject,
  ResUpdateProject,
} from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{
    Params: ReqProjectParams;
    Body: ReqUpdateProject;
    Reply: ResUpdateProject;
  }>('/', { preHandler: getProject }, async function (req, res) {
    const project = req.project!;

    if (req.body.name) {
      await db.transaction(async (transaction) => {
        await project.update(
          {
            name: req.body.name,
          },
          { transaction }
        );
        await project.onAfterUpdate(req.user!, { transaction });
      });
    }

    res.status(200).send({
      data: toApiProject(project),
    });
  });

  done();
};

export default fn;
