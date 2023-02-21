import type { FastifyPluginCallback } from 'fastify';

import type { ResListOrgs } from '../../../types/api/orgs';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{ Reply: ResListOrgs }>('/', async function (req, res) {
    const orgs: ResListOrgs['data'] = [];

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
  });

  done();
};

export default fn;
