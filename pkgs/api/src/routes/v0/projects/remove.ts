import type { FastifyPluginCallback } from 'fastify';

import { Project } from '../../../models';
import type { ReqProjectParams } from '../../../types/api/projects';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.delete<{
    Params: ReqProjectParams;
  }>('/', async function (req, res) {
    await Project.destroy({
      where: {
        // TODO validation
        orgId: req.params.orgId,
        slug: req.params.projectSlug,
      },
    });

    res.status(204).send();
  });

  done();
};

export default fn;
