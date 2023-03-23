import type { FastifyPluginCallback } from 'fastify';
import type { WhereOptions } from 'sequelize';

import { toApiActivity } from '../../../common/formatters/activity';
import { Activity } from '../../../models';
import type { ReqListActivities, ResListActivities } from '../../../types/api';
import type { DBActivity } from '../../../types/db';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{ Querystring: ReqListActivities; Reply: ResListActivities }>(
    '/',
    async function (req, res) {
      // TODO: validation
      const where: WhereOptions<DBActivity> = {
        orgId: req.query.org_id,
      };
      if (req.query.project_id) {
        where.projectId = req.query.project_id;
      }

      const activities = await Activity.scope([
        'withProject',
        'withUser',
        'withTargets',
      ]).findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0,
      });

      res.status(200).send({
        data: activities.map(toApiActivity),
      });
    }
  );

  done();
};

export default fn;
