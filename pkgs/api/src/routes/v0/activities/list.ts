import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import type { WhereOptions } from 'sequelize';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { toApiActivity } from '../../../common/formatters/activity';
import { valOrgId, valProjectId } from '../../../common/zod';
import { Activity } from '../../../models';
import type { ReqListActivities, ResListActivities } from '../../../types/api';
import type { DBActivity } from '../../../types/db';

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
  fastify.get<{ Querystring: ReqListActivities; Reply: ResListActivities }>(
    '/',
    async function (req, res) {
      const val = QueryVal(req).safeParse(req.query);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const query = val.data;
      const where: WhereOptions<DBActivity> = {
        orgId: query.org_id,
      };
      if (query.project_id) {
        where.projectId = query.project_id;
      }

      // TODO: cursor pagination
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
