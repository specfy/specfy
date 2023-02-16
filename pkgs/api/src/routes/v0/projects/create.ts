import type { FastifyPluginCallback } from 'fastify';

import { Project } from '../../../models';
import type {
  ReqPostProject,
  ResPostProject,
} from '../../../types/api/projects';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{
    Body: ReqPostProject;
    Reply: ResPostProject;
  }>('/', async function (req, res) {
    // TODO: validation
    const p = await Project.create({
      name: req.body.name,
      description: req.body.description,
      orgId: req.body.orgId,
      links: [],
    });

    res.status(200).send({
      id: p.id,
      slug: p.slug,
    });
  });

  done();
};

export default fn;
