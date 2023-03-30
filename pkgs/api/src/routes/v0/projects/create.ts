import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import z from 'zod';

import { validationError } from '../../../common/errors';
import { schemaProject } from '../../../common/validators';
import { valOrgId, valUniqueColumn } from '../../../common/zod';
import { db } from '../../../db';
import { Perm, Project } from '../../../models';
import type { ReqPostProject, ResPostProject } from '../../../types/api';

function ProjectVal(req: FastifyRequest) {
  return z
    .object({
      name: schemaProject.shape.name,
      slug: schemaProject.shape.slug.superRefine(
        valUniqueColumn(Project, 'slug', 'slug')
      ),
      orgId: valOrgId(req),
      display: schemaProject.shape.display,
    })
    .strict();
}

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.post<{
    Body: ReqPostProject;
    Reply: ResPostProject;
  }>('/', async function (req, res) {
    const val = await ProjectVal(req).safeParseAsync(req.body);
    if (!val.success) {
      return validationError(res, val.error);
    }

    const data = val.data;

    const project = await db.transaction(async (transaction) => {
      const pos = data.display.pos || { x: 0, y: 0 };
      const tmp = await Project.create({
        orgId: data.orgId,
        name: data.name,
        slug: data.slug,
        description: {
          type: 'doc',
          content: [],
        },
        links: [],
        display: { pos: { ...pos, width: 100, height: 32 } },
        edges: [],
      });
      await tmp.onAfterCreate(req.user!, { transaction });

      await Perm.create(
        {
          orgId: data.orgId,
          projectId: tmp.id,
          userId: req.user!.id,
          role: 'owner',
        },
        { transaction }
      );

      return tmp;
    });

    res.status(200).send({
      id: project.id,
      slug: project.slug,
    });
  });

  done();
};

export default fn;
