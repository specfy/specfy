import type { FastifyPluginCallback } from 'fastify';

import { Project } from '../../../models';
import type { ReqPostProject, ResPostProject } from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{
    Body: ReqPostProject;
    Reply: ResPostProject;
  }>('/', async function (req, res) {
    // TODO: validation
    const p = await Project.create({
      orgId: req.body.orgId,
      name: req.body.name,
      description: req.body.description,
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
