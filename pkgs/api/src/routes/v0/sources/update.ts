import { prisma } from '@specfy/db';
import { schemaGitHubSettings } from '@specfy/models';
import { z } from 'zod';

import type { PutSource } from '@specfy/models';

import { validationError } from '../../../common/errors.js';
import { getSource } from '../../../middlewares/getSource.js';

import type { FastifyPluginCallback } from 'fastify';

function QueryVal() {
  return z
    .object({
      name: z.string().max(50),
      settings: schemaGitHubSettings,
    })
    .strict();
}

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.put<PutSource>(
    '/',
    { preHandler: [getSource] },
    async function (req, res) {
      const val = await QueryVal().safeParseAsync(req.body);
      if (!val.success) {
        return validationError(res, val.error);
      }

      const source = req.source!;
      const data: PutSource['Body'] = val.data;

      const up = await prisma.sources.update({
        data: {
          name: data.name,
          settings: data.settings,
          updatedAt: new Date(),
        },
        where: { id: source.id },
      });

      return res.status(200).send({
        data: up,
      });
    }
  );
  done();
};

export default fn;
