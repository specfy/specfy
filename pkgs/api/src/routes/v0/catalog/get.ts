import { schemaOrgId } from '@specfy/core';
import { catalogGet } from '@specfy/models';
import { z } from 'zod';

import type { GetCatalog } from '@specfy/models';

import { notFound, validationError } from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';

import type { FastifyPluginCallback, FastifyRequest } from 'fastify';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaOrgId,
      tech_id: z.string().min(2).max(100),
    })
    .strict()
    .superRefine(valPermissions(req, 'viewer'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetCatalog>('/', async function (req, res) {
    const val = QueryVal(req).safeParse({ ...req.query, ...req.params });
    if (!val.success) {
      return validationError(res, val.error);
    }

    const query: GetCatalog['QP'] = val.data;

    const catalog = await catalogGet({
      orgId: query.org_id,
      techId: query.tech_id,
    });
    const byProject = catalog.aggregations!.byProject!;
    if (catalog.hits.hits.length <= 0) {
      return notFound(res);
    }

    return res.status(200).send({
      data: {
        tech: catalog.hits.hits[0]._source!,
        byProject: (
          byProject.buckets as Array<{ key: string; doc_count: number }>
        ).map((tech) => {
          return tech.key;
        }),
      },
    });
  });
  done();
};

export default fn;
