import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { toApiProject } from '../../../common/formatters/project';
import { valOrgId } from '../../../common/zod';
import type { Perm } from '../../../models';
import { Project } from '../../../models';
import type {
  Pagination,
  ReqListProjects,
  ResListProjects,
} from '../../../types/api';

function QueryVal(perms: Perm[]) {
  return z
    .object({
      org_id: valOrgId(perms),
    })
    .strict();
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{ Querystring: ReqListProjects; Reply: ResListProjects }>(
    '/',
    async function (req, res) {
      const val = QueryVal(req.perms!).safeParse(req.query);
      if (!val.success) {
        validationError(res, val.error);
        return;
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
