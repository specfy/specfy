import type { FastifyPluginCallback } from 'fastify';

import { Document } from '../../../models';
import type { Pagination } from '../../../types/api/api';
import type {
  ReqListDocuments,
  ResListDocuments,
} from '../../../types/api/documents';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{ Querystring: ReqListDocuments; Reply: ResListDocuments }>(
    '/',
    async function (req, res) {
      // TODO: pagination
      const pagination: Pagination = {
        current: 0,
        page: 0,
        total: 0,
      };

      const docs = await Document.findAll({
        where: {
          // TODO: validation
          orgId: req.query.org_id,
          projectId: req.query.project_id,
        },
        limit: 10,
        offset: 0,
      });

      res.status(200).send({
        data: docs.map((p) => {
          // For excess property check
          const tmp: ResListDocuments['data'][0] = {
            id: p.id,
            orgId: p.orgId,
            projectId: p.projectId,
            type: p.type,
            typeId: p.typeId,
            name: p.name,
            slug: p.slug,
            tldr: p.tldr,
            // TODO: remove all this
            blocks: p.blocks as any,
            // TODO: fill this
            authors: [],
            reviewers: [],
            approvedBy: [],
            // TODO: fill this
            create: [],
            remove: [],
            update: [],
            use: [],
            status: p.status,
            locked: p.locked,
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
