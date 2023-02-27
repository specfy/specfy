import type { FastifyPluginCallback } from 'fastify';

import { db } from '../../../db';
import { Perm } from '../../../models';
import type { ReqPostPerms, ResPostPerms } from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.put<{
    Body: ReqPostPerms;
    Reply: ResPostPerms;
  }>('/', async function (req, res) {
    await db.transaction(async (transaction) => {
      // TODO: validation
      // TODO: invite email

      const exist = await Perm.findOne({
        where: {
          orgId: req.body.org_id,
          userId: req.body.userId,
          projectId: req.body.project_id,
        },
        transaction,
      });

      // // Set viewer if we add someone direclty from a project
      // const hasOrg = exist.find((perm) => perm.projectId === null);
      // if (!hasOrg) {
      //   await Perm.create(
      //     {
      //       orgId: req.body.org_id,
      //       userId: req.body.userId,
      //       role: 'viewer',
      //     },
      //     { transaction }
      //   );
      // }

      if (exist) {
        await Perm.update(
          {
            role: req.body.role,
          },
          {
            transaction,
            where: {
              orgId: req.body.org_id,
              projectId: req.body.project_id,
              userId: req.body.userId,
            },
          }
        );
      } else {
        await Perm.create(
          {
            orgId: req.body.org_id,
            projectId: req.body.project_id,
            userId: req.body.userId,
            role: req.body.role,
          },
          { transaction }
        );
      }
    });

    res.status(200).send({
      data: { done: true },
    });
  });

  done();
};

export default fn;
