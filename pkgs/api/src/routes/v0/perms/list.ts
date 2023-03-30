import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import type { WhereOptions } from 'sequelize';
import { Op } from 'sequelize';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { toApiUser } from '../../../common/formatters/user';
import { valOrgId, valProjectId } from '../../../common/zod';
import { Perm } from '../../../models';
import type { ResListPerms, ReqListPerms } from '../../../types/api';
import type { DBPerm } from '../../../types/db';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: valOrgId(req),
      project_id: valProjectId(req),
    })
    .strict()
    .partial({ project_id: true });
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Querystring: ReqListPerms;
    Reply: ResListPerms;
  }>('/', async function (req, res) {
    const val = QueryVal(req).safeParse(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query = val.data;
    const where: WhereOptions<DBPerm> = {
      orgId: query.org_id,
      projectId: query.project_id || { [Op.is]: null },
    };

    const perms = await Perm.scope('withUser').findAll({
      where,
      // TODO: proper pagination?
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
