import type { FastifyPluginCallback } from 'fastify';

import { Project } from '../../../models';
import type { Pagination } from '../../../types/api/api';
import type {
  ReqListProjects,
  ResListProjects,
} from '../../../types/api/projects';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{ Querystring: ReqListProjects; Reply: ResListProjects }>(
    '/',
    async function (req, res) {
      // TODO: pagination
      const pagination: Pagination = {
        current: 0,
        page: 0,
        total: 0,
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
        data: projects.map((p) => {
          // For excess property check
          const tmp: ResListProjects['data'][0] = {
            id: p.id,
            orgId: p.orgId,
            blobId: p.blobId,
            description: p.description,
            name: p.name,
            slug: p.slug,
            links: p.links, // TODO: remove this in /list
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
          };
          return tmp;
        }),
        pagination,
      });
    }
  );

  done();
};

export default fn;
