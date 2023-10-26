import path from 'node:path';

import { dirname, envs, l, nanoid } from '@specfy/core';
import { prisma } from '@specfy/db';
import { createProject, getDefaultConfig } from '@specfy/models';
import { getBlobProject } from '@specfy/models/src/projects/test.utils.js';
import { sync } from '@specfy/sync';

import type { Orgs, Users } from '@specfy/db';

export async function seedE2E({ o1 }: { o1: Orgs }, users: Users[]) {
  const sourceId = nanoid();
  const settings = getDefaultConfig();
  const pE2E = await createProject({
    data: {
      ...getBlobProject(o1),
      id: 'b06tMzwd5A',
      name: 'E2E',
      Sources: {
        create: {
          id: sourceId,
          orgId: o1.id,
          type: 'github',
          identifier: `e2e/${sourceId}`,
          name: `E2E ${sourceId}`,
          settings,
        },
      },
    },
    user: users[0],
    tx: prisma,
  });
  const key = await prisma.keys.findFirst({
    select: { id: true },
    where: { projectId: pE2E.id },
  });

  const folderName = path.join(dirname, '../../');
  await sync({
    orgId: o1.id,
    projectId: pE2E.id,
    sourceId,
    token: key!.id,
    root: folderName,
    settings,
    autoLayout: true,
    hostname: envs.API_HOSTNAME?.replace('localhost', '127.0.0.1'),
    logger: l,
  });
}
