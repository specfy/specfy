import type { FastifyPluginCallback } from 'fastify';
import type { WhereOptions } from 'sequelize';

import { Perm } from '../../../models';
import type { ReqDeletePerms, ResDeletePerms } from '../../../types/api';
import type { DBPerm } from '../../../types/db/perms';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.delete<{
    Body: ReqDeletePerms;
    Reply: ResDeletePerms;
  }>('/', async function (req, res) {
    // TODO: validation

    const where: WhereOptions<DBPerm> = {
      orgId: req.body.org_id,
      userId: req.body.userId,
    };
    if (req.body.project_id) {
      where.projectId = req.body.project_id;
    }

    await Perm.destroy({
      where,
    });

    res.status(200).send({
      data: { done: true },
    });
  });

  done();
};

export default fn;
