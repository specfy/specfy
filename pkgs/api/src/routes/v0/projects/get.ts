import type { FastifyPluginCallback } from 'fastify';

import { toApiProject } from '../../../common/formatters/project';
import { getProject } from '../../../middlewares/getProject';
import { noQuery } from '../../../middlewares/noQuery';
import type {
  ReqProjectParams,
  ResGetProjectSuccess,
} from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Params: ReqProjectParams;
    Reply: ResGetProjectSuccess;
  }>('/', { preHandler: [noQuery, getProject] }, async function (req, res) {
    res.status(200).send({
      data: toApiProject(req.project!),
    });
  });

  done();
};

export default fn;
