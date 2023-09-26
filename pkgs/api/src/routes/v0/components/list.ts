import { schemaId, schemaOrgId } from '@specfy/core';
import { prisma } from '@specfy/db';
import { z } from 'zod';

import type { Pagination } from '@specfy/core';
import type { ListComponents } from '@specfy/models';

import { validationError } from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';

import type { FastifyPluginCallback, FastifyRequest } from 'fastify';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      project_id: schemaId,
    })
    .strict()
    .superRefine(valPermissions(req, 'viewer'));
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
