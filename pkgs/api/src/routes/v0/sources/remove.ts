import { prisma } from '@specfy/db';
import { logEvent } from '@specfy/events';
import { createGitHubActivity, getOrgFromRequest } from '@specfy/models';

import type { DeleteSource } from '@specfy/models';

import { getSource } from '../../../middlewares/getSource.js';
import { noBody } from '../../../middlewares/noBody.js';

import type { FastifyPluginCallback } from 'fastify';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.delete<DeleteSource>(
    '/',
    { preHandler: [noBody, getSource] },
    async function (req, res) {
      const me = req.me!;
      const source = req.source!;
      const org = getOrgFromRequest(req, source.orgId)!;

      await prisma.$transaction(async (tx) => {
        let links = source.Project!.links;
        const url = `https://github.com/${source.identifier}`;
        links = links.filter(
          (link) => link.title === 'GitHub' && link.url === url
        );

        await tx.projects.update({
          data: { links },
          where: { id: source.projectId },
        });

        const tmp = await tx.sources.delete({
          where: { id: source.id },
        });

        await createGitHubActivity({
          action: 'Github.unlinked',
          org,
          project: source.Project!,
          tx,
          user: me,
        });

        return tmp;
      });

      logEvent('github.unlink_project', {
        userId: me.id,
        orgId: org.id,
        projectId: source.projectId,
      });

      return res.status(204).send();
    }
  );
  done();
};

export default fn;
