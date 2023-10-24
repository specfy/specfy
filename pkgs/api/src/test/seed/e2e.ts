import path from 'node:path';

import { dirname, envs, l } from '@specfy/core';
import { prisma } from '@specfy/db';
import { createProject, getDefaultConfig } from '@specfy/models';
import { getBlobProject } from '@specfy/models/src/projects/test.utils.js';
import { sync } from '@specfy/sync';

import type { Orgs, Users } from '@specfy/db';

export async function seedE2E({ o1 }: { o1: Orgs }, users: Users[]) {
  const pE2E = await createProject({
    data: { ...getBlobProject(o1), id: 'b06tMzwd5A', name: 'E2E' },
    user: users[0],
    tx: prisma,
  });
  const key = await prisma.keys.findFirst({
    select: { id: true },
    where: { projectId: pE2E.id },
  });

  const projConfig = getDefaultConfig();
  const folderName = path.join(dirname, '../../');
  await sync({
    orgId: o1.id,
    projectId: pE2E.id,
    token: key!.id,
    root: folderName,
    settings: projConfig,
    autoLayout: true,
    hostname: envs.API_HOSTNAME?.replace('localhost', '127.0.0.1'),
    logger: l,
  });
}
