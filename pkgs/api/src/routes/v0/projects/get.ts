import type { FastifyPluginCallback } from 'fastify';

import { toApiProject } from '../../../common/formatters/project';
import { getProject } from '../../../middlewares/getProject';
import type { ReqProjectParams, ResGetProject } from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Params: ReqProjectParams;
    Reply: ResGetProject;
  }>('/', { preHandler: getProject }, async function (req, res) {
    res.status(200).send({
      data: toApiProject(req.project!),
    });
  });

  done();
};

export default fn;
