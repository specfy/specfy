import { toApiProject } from '@specfy/models';

import type { GetProject } from '@specfy/models';

import { getProject } from '../../../middlewares/getProject.js';

import type { FastifyPluginCallback } from 'fastify';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetProject>(
    '/',
    { preHandler: [getProject] },
    async function (req, res) {
      return res.status(200).send({
        data: toApiProject(req.project!),
      });
    }
  );
  done();
};

export default fn;
