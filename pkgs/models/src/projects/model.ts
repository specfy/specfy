import { nanoid, slugify } from '@specfy/core';

import type { Projects, Prisma, Activities, Users } from '@specfy/db';

import { createKey } from '../keys/model.js';

import type { DBProject } from './types.js';
import type { ActionProject } from '../activities/types.js';

export async function createProjectBlob({
  data,
  blob,
  tx,
}: {
  data?: Partial<Omit<Prisma.BlobsUncheckedCreateInput, 'blob'>>;
  blob: Prisma.ProjectsUncheckedCreateInput | Projects;
  tx: Prisma.TransactionClient;
}) {
  return await tx.blobs.create({
    data: {
      id: nanoid(),
      parentId: blob.blobId || null,
      type: 'project',
      typeId: blob.id,
      current: blob as any,
      created: false,
      deleted: false,
      ...data,
    },
  });
}

export async function createProject({
  data,
  user,
  tx,
}: {
  data: Omit<Prisma.ProjectsUncheckedCreateInput, 'blobId' | 'id' | 'slug'> &
    Partial<Pick<Prisma.ProjectsUncheckedCreateInput, 'id' | 'slug'>>;
  user: Users;
  tx: Prisma.TransactionClient;
}) {
  const body: Prisma.ProjectsUncheckedCreateInput = {
    ...data,
    slug: data.slug || slugify(data.name),
    id: data.id || nanoid(),
    blobId: null,
  };
  const tmp = await tx.projects.create({
    data: body,
  });
  const blob = await createProjectBlob({
    blob: tmp,
    data: { created: true },
    tx,
  });

  const update = await tx.projects.update({
    data: { blobId: blob.id },
    where: { id: tmp.id },
  });

  await tx.perms.create({
    data: {
      id: nanoid(),
      orgId: data.orgId,
      projectId: tmp.id,
      userId: user.id,
      role: 'owner',
    },
  });

  const activityGroupId = nanoid();
  await createProjectActivity({
    user,
    action: 'Project.created',
    target: update,
    tx,
    activityGroupId,
  });

  await createKey({
    tx,
    user,
    data: { orgId: body.orgId, projectId: tmp.id },
    activityGroupId,
  });

  return update;
}

export async function createProjectActivity({
  user,
  action,
  target,
  tx,
  activityGroupId = null,
}: {
  user: Users;
  action: ActionProject;
  target: Projects;
  tx: Prisma.TransactionClient;
  activityGroupId?: string | null;
}): Promise<Activities> {
  return await tx.activities.create({
    data: {
      id: nanoid(),
      action,
      userId: user.id,
      orgId: target.orgId,
      projectId: target.id,
      activityGroupId,
      targetBlobId: target.blobId,
      createdAt: new Date(),
    },
  });
}

export function getDefaultConfig(): DBProject['config'] {
  return {
    branch: 'main',
    documentation: {
      enabled: true,
      path: '/',
    },
    stack: {
      enabled: true,
      path: '/',
    },
  };
}
