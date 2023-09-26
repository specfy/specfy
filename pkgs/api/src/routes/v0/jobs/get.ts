import { prisma } from '@specfy/db';
import { toApiJob } from '@specfy/models';

import type { GetJob } from '@specfy/models';

import { getJob } from '../../../middlewares/getJob.js';

import type { FastifyPluginCallback } from 'fastify';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetJob>('/', { preHandler: [getJob] }, async function (req, res) {
    const job = req.job!;
    let logs = '';

    if (job.logsId) {
      const row = await prisma.logs.findFirst({
        where: { id: job.logsId },
      });
      if (row?.content) {
        logs = row.content;
      }
    }

    return res.status(200).send({
      data: toApiJob(job, logs),
    });
  });
  done();
};

export default fn;
