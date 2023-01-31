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
        current: 0,
        page: 0,
        total: 0,
      };
      console.log(req.query.org_id);

      const docs = await Component.findAll({
        where: {
          // TODO: validation
          orgId: req.query.org_id,
          projectId: req.query.project_id,
        },
        limit: 1000,
        offset: 0,
      });

      res.status(200).send({
        data: docs.map((p) => {
          return {
            id: p.id,
            orgId: p.orgId,
            projectId: p.projectId,
            type: p.type,
            typeId: p.typeId,
            name: p.name,
            slug: p.slug,
            description: p.description,
            tech: p.tech,
            display: p.display,
            inComponent: p.inComponent,
            fromComponents: p.fromComponents,
            toComponents: p.toComponents,

            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
          };
        }),
        pagination,
      });
    }
  );

  done();
};

export default fn;
