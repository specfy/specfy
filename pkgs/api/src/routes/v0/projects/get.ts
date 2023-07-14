import type { FastifyPluginCallback } from 'fastify';

import { getProject } from '../../../middlewares/getProject.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import { toApiProject } from '../../../models/project/project.js';
import type { GetProject } from '../../../types/api/index.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetProject>(
    '/',
    { preHandler: [noQuery, getProject] },
    async function (req, res) {
      return res.status(200).send({
        data: toApiProject(req.project!),
      });
    }
  );
  done();
};

export default fn;
