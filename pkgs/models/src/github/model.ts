import { nanoid } from '@specfy/core';
import type { Activities, Orgs, Prisma, Projects, Users } from '@specfy/db';

import type { ActionGitHub } from '../activities/types.js';

export async function createGitHubActivity({
  user,
  action,
  org,
  project,
  tx,
  activityGroupId = null,
}: {
  user: Users;
  action: ActionGitHub;
  org: Orgs;
  project?: Projects;
  tx: Prisma.TransactionClient;
  activityGroupId?: string | null;
}): Promise<Activities> {
  return await tx.activities.create({
    data: {
      id: nanoid(),
      action,
      userId: user.id,
      orgId: org.id,
      projectId: project?.id || null,
      activityGroupId,
      createdAt: new Date(),
    },
  });
}
