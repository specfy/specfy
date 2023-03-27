import type { FastifyPluginCallback } from 'fastify';

import { notFound } from '../../../common/errors';
import { toApiProject } from '../../../common/formatters/project';
import { db } from '../../../db';
import { Project } from '../../../models';
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
  }>('/', async function (req, res) {
    const proj = await Project.findOne({
      where: {
        // TODO validation
        orgId: req.params.org_id,
        slug: req.params.project_slug,
      },
    });

    if (!proj) {
      return notFound(res);
    }

    if (req.body.name) {
      await db.transaction(async (transaction) => {
        await proj.update(
          {
            name: req.body.name,
          },
          { transaction }
        );
        await proj.onAfterUpdate(req.user!, { transaction });
      });
    }

    res.status(200).send({
      data: toApiProject(proj),
    });
  });

  done();
};

export default fn;
