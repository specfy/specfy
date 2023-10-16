import { schemaOrgId } from '@specfy/core';
import { catalogList } from '@specfy/models';
import { z } from 'zod';

import type { Pagination } from '@specfy/core';
import type { ListCatalog } from '@specfy/models';

import { validationError } from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';

import type { FastifyPluginCallback, FastifyRequest } from 'fastify';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      // TODO: sync this with schemaComponent
      type: z.enum([
        'all',
        'analytics',
        'api',
        'app',
        'ci',
        'cloud',
        'db',
        'etl',
        'framework',
        'hosting',
        'language',
        'messaging',
        'monitoring',
        'network',
        'saas',
        'storage',
        'tool',
        'unknown',
      ]),
    })
    .strict()
    .superRefine(valPermissions(req, 'viewer'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<ListCatalog>('/', async function (req, res) {
    const val = QueryVal(req).safeParse(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query: ListCatalog['Querystring'] = val.data;

    // TODO: pagination

    const catalog = await catalogList({
      orgId: query.org_id,
      type: query.type,
    });
    const byName = catalog.aggregations!.byName!;
    const byType = catalog.aggregations!.byType;
    const pagination: Pagination = {
      currentPage: 0,
      totalItems: (catalog.hits.total as any).value,
    };

    return res.status(200).send({
      data: {
        byName: (
          byName.buckets as Array<{ key: string; doc_count: number }>
        ).map((tech) => {
          return { key: tech.key, count: tech.doc_count };
        }),
        byType: byType
          ? (
              byType.buckets as Array<{
                key: string;
                distinct: { value: number };
              }>
            ).map((row) => {
              return { key: row.key, count: row.distinct.value };
            })
          : null,
      },
      pagination,
    });
  });
  done();
};

export default fn;
