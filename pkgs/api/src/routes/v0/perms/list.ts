import type { FastifyPluginCallback } from 'fastify';
import type { WhereOptions } from 'sequelize';
import { Op } from 'sequelize';

import { toApiUser } from '../../../common/formatters/user';
import { Perm } from '../../../models';
import type { ResListPerms, ReqListPerms } from '../../../types/api';
import type { DBPerm } from '../../../types/db/perms';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Querystring: ReqListPerms;
    Reply: ResListPerms;
  }>('/', async function (req, res) {
    const where: WhereOptions<DBPerm> = {
      // TODO: validation
      orgId: req.query.org_id,
      projectId: req.query.project_id || { [Op.is]: null },
    };

    const perms = await Perm.scope('withUser').findAll({
      where,
      limit: 500,
      offset: 0,
    });

    res.status(200).send({
      data: perms.map((p) => {
        // For excess property check
        const tmp: ResListPerms['data'][0] = {
          id: p.id,
          orgId: p.orgId,
          projectId: p.projectId,
          user: toApiUser(p.user),
          role: p.role,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
        return tmp;
      }),
    });
  });

  done();
};

export default fn;
