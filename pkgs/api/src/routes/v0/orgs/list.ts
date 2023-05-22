import type { FastifyPluginCallback } from 'fastify';

import { noQuery } from '../../../middlewares/noQuery';
import type { ResListOrgsSuccess } from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{ Reply: ResListOrgsSuccess }>(
    '/',
    { preHandler: noQuery },
    async function (req, res) {
      const orgs: ResListOrgsSuccess['data'] = [];

      for (const perm of req.perms!) {
        if (perm.projectId) {
          continue;
        }

        orgs.push({
          id: perm.Org.id,
          name: perm.Org.name,
          isPersonal: perm.Org.isPersonal,
          logo: 'https://www.ycombinator.com/packs/static/ycdc/ycombinator-logo-ee6c80faf1d1ce2491d8.png',
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
