import type { FastifyPluginCallback } from 'fastify';

import { notFound } from '../../../common/errors';
import { Project } from '../../../models';
import type {
  ReqProjectParams,
  ResGetProject,
} from '../../../types/api/projects';

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
        name: p.name,
        description: p.description,
        links: p.links,
        orgId: p.orgId,
        slug: p.slug,
        // TODO: fill this
        contributors: [],
        owners: [],
        reviewers: [],
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      },
    });
  });

  done();
};

export default fn;
