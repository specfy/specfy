import { nanoid } from '../../common/id.js';
import { prisma } from '../../db/index.js';

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

  await prisma.jobs.create({
    data: {
      id: nanoid(),
      orgId: res.orgId,
      projectId: res.id,
      type: 'deploy',
      status: 'pending',
      config: { url: 'specfy/specfy', autoLayout: true },
      userId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: null,
      finishedAt: null,
    },
  });

  await prisma.$disconnect();
})();
