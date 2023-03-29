import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { valOrgId, valId } from '../../../common/zod';
import type { Perm } from '../../../models';
import { Component } from '../../../models';
import type {
  Pagination,
  ReqListComponents,
  ResListComponents,
} from '../../../types/api';

function QueryVal(perms: Perm[]) {
  return z
    .object({
      org_id: valOrgId(perms),
      project_id: valId(),
    })
    .strict();
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{ Querystring: ReqListComponents; Reply: ResListComponents }>(
    '/',
    async function (req, res) {
      const val = QueryVal(req.perms!).safeParse(req.query);
      if (!val.success) {
        validationError(res, val.error);
        return;
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
