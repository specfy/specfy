import type { FastifyPluginCallback } from 'fastify';

import { Component } from '../../../models';
import type { Pagination } from '../../../types/api/api';
import type {
  ReqListComponents,
  ResListComponents,
} from '../../../types/api/components';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{ Querystring: ReqListComponents; Reply: ResListComponents }>(
    '/',
    async function (req, res) {
      // TODO: pagination or remove it
      const pagination: Pagination = {
        currentPage: 0,
        totalItems: 0,
      };

      const docs = await Component.findAll({
        where: {
          // TODO: validation
          orgId: req.query.org_id,
          projectId: req.query.project_id,
        },
        order: [['name', 'ASC']],
        limit: 1000,
        offset: 0,
      });

      res.status(200).send({
        data: docs.map((p) => {
          // For excess property check
          const tmp: ResListComponents['data'][0] = {
            id: p.id,
            orgId: p.orgId,
            projectId: p.projectId,
            blobId: p.blobId,

            type: p.type,
            typeId: p.typeId,
            name: p.name,
            slug: p.slug,
            description: p.description,
            tech: p.tech,
            display: p.display,
            inComponent: p.inComponent,
            edges: p.edges,

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
