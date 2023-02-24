import type { FastifyPluginCallback } from 'fastify';

import { Project } from '../../../models';
import type { ReqProjectParams } from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.delete<{
    Params: ReqProjectParams;
  }>('/', async function (req, res) {
    await Project.destroy({
      where: {
        // TODO validation
        orgId: req.params.org_id,
        slug: req.params.project_slug,
      },
    });

    res.status(204).send();
  });

  done();
};

export default fn;
