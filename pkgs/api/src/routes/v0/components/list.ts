import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { schemaId, schemaOrgId } from '../../../common/validators/common.js';
import { valPermissions } from '../../../common/zod.js';
import { prisma } from '../../../db/index.js';
import type { ListComponents, Pagination } from '../../../types/api/index.js';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      project_id: schemaId,
    })
    .strict()
    .superRefine(valPermissions(req));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<ListComponents>('/', async function (req, res) {
    const val = QueryVal(req).safeParse(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query: ListComponents['Querystring'] = val.data;

    // TODO: pagination or remove it
    const pagination: Pagination = {
      currentPage: 0,
      totalItems: 0,
    };

    const docs = await prisma.components.findMany({
      where: {
        orgId: query.org_id,
        projectId: query.project_id,
      },
      orderBy: { name: 'asc' },
      take: 1000,
      skip: 0,
    });

    return res.status(200).send({
      data: docs.map((p) => {
        // For excess property check
        const tmp: ListComponents['Success']['data'][0] = {
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
          techs: p.techs,
          display: p.display,
          inComponent: p.inComponent,
          edges: p.edges,

          show: p.show,
          tags: p.tags,

          source: p.source,
          sourceName: p.sourceName,
          sourcePath: p.sourcePath,

          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
        return tmp;
      }),
      pagination,
    });
  });
  done();
};

export default fn;
