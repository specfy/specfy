import type { FastifyPluginCallback } from 'fastify';

import { toApiProject } from '../../../common/formatters/project';
import { Project } from '../../../models';
import type {
  Pagination,
  ReqListProjects,
  ResListProjects,
} from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{ Querystring: ReqListProjects; Reply: ResListProjects }>(
    '/',
    async function (req, res) {
      // TODO: pagination
      const pagination: Pagination = {
        currentPage: 0,
        totalItems: 0,
      };

      const projects = await Project.findAll({
        where: {
          // TODO: validation
          orgId: req.query.org_id,
        },
        order: [['name', 'ASC']],
        limit: 10,
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
