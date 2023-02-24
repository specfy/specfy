import type { FastifyPluginCallback } from 'fastify';

import { notFound } from '../../../common/errors';
import { Project } from '../../../models';
import type { ReqProjectParams, ResGetProject } from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{
    Params: ReqProjectParams;
    Reply: ResGetProject;
  }>('/', async function (req, res) {
    const p = await Project.findOne({
      where: {
        // TODO validation
        orgId: req.params.org_id,
        slug: req.params.project_slug,
      },
    });

    if (!p) {
      return notFound(res);
    }

    res.status(200).send({
      data: {
        id: p.id,
        orgId: p.orgId,
        blobId: p.blobId,
        name: p.name,
        description: p.description,
        links: p.links,
        slug: p.slug,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      },
    });
  });

  done();
};

export default fn;
