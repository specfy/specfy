import { toApiJob } from '@specfy/models';
import type { GetJob } from '@specfy/models';
import type { FastifyPluginCallback } from 'fastify';

import { getJob } from '../../../middlewares/getJob.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetJob>('/', { preHandler: [getJob] }, async function (req, res) {
    const job = req.job!;
    return res.status(200).send({
      data: toApiJob(job),
    });
  });
  done();
};

export default fn;
