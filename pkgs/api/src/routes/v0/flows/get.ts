import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { notFound, validationError } from '../../../common/errors.js';
import { schemaOrgId } from '../../../common/validators/common.js';
import { valPermissions } from '../../../common/zod.js';
import { prisma } from '../../../db/index.js';
import type { GetFlow } from '../../../types/api/index.js';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
    })
    .strict()
    .superRefine(valPermissions(req));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetFlow>('/', async function (req, res) {
    const val = QueryVal(req).safeParse(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query: GetFlow['Querystring'] = val.data;
    const snap = await prisma.flows.findFirst({
      where: {
        orgId: query.org_id,
      },
    });
    if (!snap) {
      return notFound(res);
    }

    return res.status(200).send({
      data: {
        id: snap.id,
        flow: snap.flow,
        createdAt: snap.createdAt.toISOString(),
        updatedAt: snap.createdAt.toISOString(),
      },
    });
  });

  done();
};

export default fn;
