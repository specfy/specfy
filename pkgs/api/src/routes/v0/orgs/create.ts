import type { FastifyPluginCallback } from 'fastify';

import { db } from '../../../db';
import { Org, Perm } from '../../../models';
import type { ReqPostOrg, ResPostOrg } from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{
    Body: ReqPostOrg;
    Reply: ResPostOrg;
  }>('/', async function (req, res) {
    // TODO: validation
    const org = await db.transaction(async (transaction) => {
      const tmp = await Org.create(
        {
          id: req.body.id,
          name: req.body.name,
        },
        { transaction }
      );
      await tmp.onAfterCreate(req.user!, { transaction });

      await Perm.create(
        {
          orgId: req.body.id,
          projectId: null,
          userId: req.user!.id,
          role: 'owner',
        },
        { transaction }
      );

      return tmp;
    });

    res.status(200).send({
      id: org.id,
      name: org.name,
    });
  });

  done();
};

export default fn;
