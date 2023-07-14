import type { Activities, Orgs, Prisma, Projects, Users } from '@prisma/client';

import { nanoid } from '../../common/id.js';
import type { ActionGithub } from '../../types/db/index.js';

export async function createGithubActivity({
  user,
  action,
  org,
  project,
  tx,
  activityGroupId = null,
}: {
  user: Users;
  action: ActionGithub;
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
