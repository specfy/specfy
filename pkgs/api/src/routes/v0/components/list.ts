import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { valOrgId, valProjectId } from '../../../common/zod';
import { Component } from '../../../models';
import type {
  Pagination,
  ReqListComponents,
  ResListComponents,
} from '../../../types/api';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: valOrgId(req),
      project_id: valProjectId(req),
    })
    .strict();
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{ Querystring: ReqListComponents; Reply: ResListComponents }>(
    '/',
    async function (req, res) {
      const val = QueryVal(req).safeParse(req.query);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const query = val.data;

      // TODO: pagination or remove it
      const pagination: Pagination = {
        currentPage: 0,
        totalItems: 0,
      };

      const docs = await Component.findAll({
        where: {
          orgId: query.org_id,
          projectId: query.project_id,
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
            techId: p.techId,

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
