import type { FastifyPluginCallback } from 'fastify';

import { noQuery } from '../../../middlewares/noQuery';
import type { ResListOrgs, ResListOrgsSuccess } from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{ Reply: ResListOrgs }>(
    '/',
    { preHandler: noQuery },
    async function (req, res) {
      const orgs: ResListOrgsSuccess['data'] = [];

      for (const perm of req.perms!) {
        if (perm.projectId) {
          continue;
        }

        orgs.push({
          id: perm.org.id,
          name: perm.org.name,
        });
      }

      res.status(200).send({
        data: orgs,
      });
    }
  );

  done();
};

export default fn;
