import { prisma } from '@specfy/db';

import { createJobDeploy, userGithubApp } from '../../models/index.js';

// Publish a job in the queue
(async () => {
  const res = await prisma.projects.findFirst({
    where: {
      name: 'Analytics',
    },
  });
  if (!res) {
    throw new Error('No project, did you seed first??');
  }

  await createJobDeploy({
    orgId: res.orgId,
    projectId: res.id,
    userId: userGithubApp.id,
    config: { url: 'specfy/specfy', autoLayout: false },
    tx: prisma,
  });

  await prisma.$disconnect();
})();
