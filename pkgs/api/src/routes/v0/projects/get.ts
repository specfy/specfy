import type { FastifyPluginCallback } from 'fastify';

import { toApiProject } from '../../../common/formatters/project.js';
import { getProject } from '../../../middlewares/getProject.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import type { GetProject } from '../../../types/api/index.js';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<GetProject>(
    '/',
    { preHandler: [noQuery, getProject] },
    async function (req, res) {
      res.status(200).send({
        data: toApiProject(req.project!),
      });
    }
  );

  done();
};

export default fn;
