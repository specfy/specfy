import type { FastifyPluginCallback } from 'fastify';

import { toApiOrg } from '../../../common/formatters/org.js';
import { noQuery } from '../../../middlewares/noQuery.js';
import type { ListOrgs } from '../../../types/api/index.js';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<ListOrgs>(
    '/',
    { preHandler: noQuery },
    async function (req, res) {
      const orgs: ListOrgs['Success']['data'] = [];

      for (const perm of req.perms!) {
        if (perm.projectId) {
          continue;
        }

        orgs.push(toApiOrg(perm.Org));
      }

      res.status(200).send({
        data: orgs,
      });
    }
  );

  done();
};

export default fn;
