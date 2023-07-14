import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors.js';
import { schemaOrgId } from '../../../common/validators/index.js';
import { valPermissions } from '../../../common/zod.js';
import { prisma } from '../../../db/index.js';
import { toApiProject } from '../../../models/projects/formatter.js';
import type { ListProjects, Pagination } from '../../../types/api/index.js';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
    })
    .strict()
    .superRefine(valPermissions(req));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<ListProjects>('/', async function (req, res) {
    const val = QueryVal(req).safeParse(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query: ListProjects['Querystring'] = val.data;

    // TODO: pagination
    const pagination: Pagination = {
      currentPage: 0,
      totalItems: 0,
    };

    // TODO: perms
    const projects = await prisma.projects.findMany({
      where: {
        orgId: query.org_id,
      },
      orderBy: { name: 'asc' },
      take: 20,
      skip: 0,
    });

    return res.status(200).send({
      data: projects.map(toApiProject),
      pagination,
    });
  });
  done();
};

export default fn;
