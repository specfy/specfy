import type { FastifyPluginCallback } from 'fastify';

import { getJob } from '../../../middlewares/getJob.js';
import { toApiJob } from '../../../models/jobs/formatter.js';
import type { GetJob } from '../../../types/api/index.js';

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
