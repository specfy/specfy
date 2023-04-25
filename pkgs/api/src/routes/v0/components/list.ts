import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { valOrgId, valProjectId } from '../../../common/zod';
import { prisma } from '../../../db';
import type {
  ApiComponent,
  BlockLevelZero,
  Pagination,
  ReqListComponents,
  ResListComponentsSuccess,
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
  fastify.get<{
    Querystring: ReqListComponents;
    Reply: ResListComponentsSuccess;
  }>('/', async function (req, res) {
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

    const docs = await prisma.components.findMany({
      where: {
        orgId: query.org_id,
        projectId: query.project_id,
      },
      orderBy: { name: 'asc' },
      take: 1000,
      skip: 0,
    });

    res.status(200).send({
      data: docs.map((p) => {
        // For excess property check
        const tmp: ResListComponentsSuccess['data'][0] = {
          id: p.id,
          orgId: p.orgId,
          projectId: p.projectId,
          blobId: p.blobId,
          techId: p.techId,

          type: p.type as ApiComponent['type'],
          typeId: p.typeId,
          name: p.name,
          slug: p.slug,
          description: p.description as unknown as BlockLevelZero,
          tech: p.tech as ApiComponent['tech'],
          display: p.display as unknown as ApiComponent['display'],
          inComponent: p.inComponent,
          edges: p.edges as unknown as ApiComponent['edges'],

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
