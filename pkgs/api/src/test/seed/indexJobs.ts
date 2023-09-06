import { prisma } from '@specfy/db';
import { createJobDeploy, userGitHubApp } from '@specfy/models';

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
    userId: userGitHubApp.id,
    config: { url: 'specfy/specfy', autoLayout: false, project: res.config },
    tx: prisma,
  });

  await prisma.$disconnect();
})();
