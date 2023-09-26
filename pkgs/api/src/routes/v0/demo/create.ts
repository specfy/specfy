import { nanoid } from '@specfy/core';
import { prisma } from '@specfy/db';
import { createOrg, toApiOrgList } from '@specfy/models';

import type { PostDemo } from '@specfy/models';

import { noBody } from '../../../middlewares/noBody.js';
import { noQuery } from '../../../middlewares/noQuery.js';

import { createDemo } from './createDemo.js';

import type { FastifyPluginCallback } from 'fastify';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post<PostDemo>(
    '/',
    {
      preHandler: [noQuery, noBody],
      config: {
        rateLimit: { max: 5 },
      },
    },
    async function (req, res) {
      const me = req.me!;

      const org = await prisma.$transaction(async (tx) => {
        const tmp = await createOrg(tx, me, {
          id: `demo-${nanoid().toLocaleLowerCase()}`,
          name: 'Demo',
        });

        await createDemo(tx, tmp, me);

        return tmp;
      });

      return res.status(200).send({ data: toApiOrgList(org) });
    }
  );
  done();
};

export default fn;
