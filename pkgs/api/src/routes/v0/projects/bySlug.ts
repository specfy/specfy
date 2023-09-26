import { prisma } from '@specfy/db';
import {
  checkInheritedPermissions,
  schemaProject,
  toApiProject,
} from '@specfy/models';
import { z } from 'zod';

import type { GetProjectBySlug } from '@specfy/models';

import {
  forbidden,
  notFound,
  validationError,
} from '../../../common/errors.js';
import { valPermissions } from '../../../common/zod.js';

import type { FastifyPluginCallback, FastifyRequest } from 'fastify';

function QueryVal(req: FastifyRequest) {
  return z
    .object({
      org_id: schemaProject.shape.orgId,
      slug: schemaProject.shape.slug,
    })
    .strict()
    .superRefine(valPermissions(req, 'viewer'));
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<GetProjectBySlug>('/', async function (req, res) {
    const val = QueryVal(req).safeParse({ ...req.query });
    if (!val.success) {
      return validationError(res, val.error);
    }

    const data: GetProjectBySlug['Querystring'] = val.data;
    const proj = await prisma.projects.findUnique({
      where: {
        orgId_slug: { orgId: data.org_id, slug: data.slug },
      },
    });
    if (!proj) {
      return notFound(res);
    }
    if (!checkInheritedPermissions(req.perms!, 'viewer', proj.orgId, proj.id)) {
      return forbidden(res);
    }

    return res.status(200).send({
      data: toApiProject(proj),
    });
  });
  done();
};

export default fn;
