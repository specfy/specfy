import type { FastifyPluginCallback } from 'fastify';

import { notFound } from '../../../common/errors';
import { toApiProject } from '../../../common/formatters/project';
import { Project } from '../../../models';
import type { ReqProjectParams, ResGetProject } from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Params: ReqProjectParams;
    Reply: ResGetProject;
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

    res.status(200).send({
      data: toApiProject(proj),
    });
  });

  done();
};

export default fn;
