import type { FastifyPluginCallback } from 'fastify';

import { Project } from '../../../models';
import type { ReqPostProject, ResPostProject } from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{
    Body: ReqPostProject;
    Reply: ResPostProject;
  }>('/', async function (req, res) {
    // TODO: validation
    const pos = req.body.display.pos || { x: 0, y: 0 };
    const p = await Project.create({
      orgId: req.body.orgId,
      name: req.body.name,
      description: {
        type: 'doc',
        content: [],
      },
      links: [],
      display: { pos: { ...pos, width: 100, height: 32 } },
      edges: [],
    });

    res.status(200).send({
      id: p.id,
      slug: p.slug,
    });
  });

  done();
};

export default fn;
