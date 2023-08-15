import { toApiProject } from '@specfy/models';
import type { GetProject } from '@specfy/models';
import type { FastifyPluginCallback } from 'fastify';

import { getProject } from '../../../middlewares/getProject.js';
import { noQuery } from '../../../middlewares/noQuery.js';

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
