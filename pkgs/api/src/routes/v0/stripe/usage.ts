import type { FastifyPluginCallback } from 'fastify';

import { getOrg } from '../../../middlewares/getOrg.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import { getUsage } from '../../../models/billing/model.js';
import type { GetBillingUsage } from '../../../types/api/index.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetBillingUsage>(
    '/',
    { preHandler: [noQuery, getOrg] },
    async function (req, res) {
      const org = req.org!;

      const usage = await getUsage(org);
      res.status(200).send({
        data: usage,
      });
    }
  );
  done();
};

export default fn;
