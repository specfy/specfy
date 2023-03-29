import type { FastifyPluginCallback } from 'fastify';

import { noQuery } from '../../../middlewares/noQuery';
import { User } from '../../../models';
import type { ResGetMe } from '../../../types/api';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get<{ Reply: ResGetMe }>(
    '/me',
    { preHandler: noQuery },
    async function (_req, res) {
      const user = (await User.findOne({
        where: {
          // TODO: actual user
          email: 'bodin.samuel@gmail.com',
        },
      }))!;

      res.status(200).send({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      });
    }
  );

  done();
};

export default fn;
