import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { toApiProject } from '../../../common/formatters/project';
import { schemaProject } from '../../../common/validators';
import { db } from '../../../db';
import { getProject } from '../../../middlewares/getProject';
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
  }>('/', { preHandler: getProject }, async function (req, res) {
    const val = BodyVal().safeParse(req);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const data = val.data;
    const project = req.project!;

    if (data.name) {
      await db.transaction(async (transaction) => {
        await project.update(
          {
            name: data.name,
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
