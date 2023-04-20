import type { Prisma } from '@prisma/client';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { validationError } from '../../../common/errors';
import { toApiUser } from '../../../common/formatters/user';
import { valOrgId, valProjectId } from '../../../common/zod';
import { prisma } from '../../../db';
import type {
  ReqListPerms,
  ApiPerm,
  ResListPermsSuccess,
} from '../../../types/api';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: valOrgId(req),
      project_id: valProjectId(req),
    })
    .strict()
    .partial({ project_id: true });
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Querystring: ReqListPerms;
    Reply: ResListPermsSuccess;
  }>('/', async function (req, res) {
    const val = QueryVal(req).safeParse(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query = val.data;
    const where: Prisma.PermsWhereInput = {
      orgId: query.org_id,
      projectId: query.project_id || null,
    };

    const perms = await prisma.perms.findMany({
      where,
      include: { User: true },
      orderBy: { createdAt: 'asc' },
      // TODO: proper pagination?
      take: 500,
      skip: 0,
    });

    res.status(200).send({
      data: perms.map((p) => {
        // For excess property check
        const tmp: ResListPermsSuccess['data'][0] = {
          id: p.id,
          orgId: p.orgId,
          projectId: p.projectId,
          user: toApiUser(p.User!),
          role: p.role as ApiPerm['role'],
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
        return tmp;
      }),
    });
  });

  done();
};

export default fn;
