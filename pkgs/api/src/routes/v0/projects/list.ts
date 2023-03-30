import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { toApiProject } from '../../../common/formatters/project';
import { valOrgId } from '../../../common/zod';
import { Project } from '../../../models';
import type {
  Pagination,
  ReqListProjects,
  ResListProjects,
} from '../../../types/api';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: valOrgId(req),
    })
    .strict();
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{ Querystring: ReqListProjects; Reply: ResListProjects }>(
    '/',
    async function (req, res) {
      const val = QueryVal(req).safeParse(req.query);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const query = val.data;

      // TODO: pagination
      const pagination: Pagination = {
        currentPage: 0,
        totalItems: 0,
      };

      // TODO: perms
      const projects = await Project.findAll({
        where: {
          orgId: query.org_id,
        },
        order: [['name', 'ASC']],
        limit: 20,
        offset: 0,
      });

      res.status(200).send({
        data: projects.map(toApiProject),
        pagination,
      });
    }
  );

  done();
};

export default fn;
