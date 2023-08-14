import { toApiOrgList } from '@specfy/models';
import type { ListOrgs } from '@specfy/models';
import type { FastifyPluginCallback } from 'fastify';

import { noQuery } from '../../../middlewares/noQuery.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<ListOrgs>(
    '/',
    { preHandler: noQuery },
    async function (req, res) {
      const orgs: ListOrgs['Success']['data'] = [];

      for (const perm of req.perms!) {
        if (perm.projectId) {
          continue;
        }

        orgs.push(toApiOrgList(perm.Org));
      }

      return res.status(200).send({
        data: orgs,
      });
    }
  );
  done();
};

export default fn;
