import { schemaOrgId } from '@specfy/core';
import { catalogSummary } from '@specfy/models';
import { z } from 'zod';

import type { GetCatalogSummary } from '@specfy/models';

import { validationError } from '../../../../common/errors.js';
import { valPermissions } from '../../../../common/zod.js';

import type { FastifyPluginCallback, FastifyRequest } from 'fastify';

function QueryVal(req: FastifyRequest) {
  return z
    .object({ org_id: schemaOrgId })
    .strict()
    .superRefine(valPermissions(req, 'viewer'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetCatalogSummary>('/', async function (req, res) {
    const val = QueryVal(req).safeParse(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query: GetCatalogSummary['Querystring'] = val.data;

    const catalog = await catalogSummary({ orgId: query.org_id });
    console.log(catalog);

    return res.status(200).send({
      data: {
        count: catalog.aggregations?.count.value || 0,
      },
    });
  });
  done();
};

export default fn;
