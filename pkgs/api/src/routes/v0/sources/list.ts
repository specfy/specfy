import { schemaId, schemaOrgId } from '@specfy/core';
import { prisma } from '@specfy/db';
import { z } from 'zod';

import type { ListSources } from '@specfy/models';

import { validationError } from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';

import type { FastifyPluginCallback, FastifyRequest } from 'fastify';

function QueryVal(req: FastifyRequest) {
  return z
    .object({ org_id: schemaOrgId, project_id: schemaId })
    .strict()
    .superRefine(valPermissions(req, 'owner'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<ListSources>('/', async function (req, res) {
    const val = await QueryVal(req).safeParseAsync(req.query);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const data: ListSources['Querystring'] = val.data;

    const list = await prisma.sources.findMany({
      where: { orgId: data.org_id, projectId: data.project_id },
    });

    return res.status(200).send({
      data: list,
    });
  });
  done();
};

export default fn;
