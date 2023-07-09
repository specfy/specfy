import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { notFound, validationError } from '../../../common/errors.js';
import { schemaId, schemaOrgId } from '../../../common/validators/common.js';
import { valPermissions } from '../../../common/zod.js';
import { prisma } from '../../../db/index.js';
import type { GetFlow } from '../../../types/api/index.js';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      flow_id: schemaId,
    })
    .strict()
    .superRefine(valPermissions(req));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetFlow>('/', async function (req, res) {
    const val = QueryVal(req).safeParse({ ...req.query, ...req.params });
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query: GetFlow['Params'] & GetFlow['Querystring'] = val.data;
    const flow = await prisma.flows.findFirst({
      where: {
        id: query.flow_id,
        orgId: query.org_id,
      },
    });

    if (!flow) {
      return notFound(res);
    }

    return res.status(200).send({
      data: {
        id: flow.id,
        flow: flow.flow,
        createdAt: flow.createdAt.toISOString(),
        updatedAt: flow.createdAt.toISOString(),
      },
    });
  });
  done();
};

export default fn;
