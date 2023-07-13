import { prisma } from '../../db/index.js';
import { createJobDeploy } from '../../models/index.js';

// Publish a job in the queue
(async () => {
  const res = await prisma.projects.findFirst({
    where: {
      name: 'API',
    },
  });
  if (!res) {
    throw new Error('No project, did you seed first??');
  }

  await createJobDeploy({
    orgId: res.orgId,
    projectId: res.id,
    config: { url: 'specfy/specfy', autoLayout: true },
    tx: prisma,
  });

  await prisma.$disconnect();
})();
