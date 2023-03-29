import type { FastifyPluginCallback } from 'fastify';

import { db } from '../../../db';
import { getProject } from '../../../middlewares/getProject';
import type { ReqProjectParams } from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.delete<{
    Params: ReqProjectParams;
  }>('/', { preHandler: getProject }, async function (req, res) {
    await db.transaction(async (transaction) => {
      await req.project!.destroy({ transaction });
      await req.project!.onAfterDelete(req.user!, { transaction });
    });

    res.status(204).send();
  });

  done();
};

export default fn;
