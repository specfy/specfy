import type { Projects, Prisma, Activities, Users } from '@prisma/client';

import { nanoid } from '../common/id';
import { slugify } from '../common/string';
import type { ActionProject } from '../types/db';

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
      blob: blob as any,
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
    slug: slugify(data.name),
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
  await createProjectActivity(user, 'Project.created', update, tx);

  return tmp;
}

export async function updateProject({
  data,
  original,
  user,
  tx,
}: {
  data: Partial<Projects>;
  original: Projects;
  user: Users;
  tx: Prisma.TransactionClient;
}) {
  if (data.name && data.name !== original.name) {
    data.slug = slugify(data.name);
  }
  const blob = await createProjectBlob({ blob: { ...original, ...data }, tx });

  const tmp = await tx.projects.update({
    data: { ...(data as Prisma.ProjectsUncheckedUpdateInput), blobId: blob.id },
    where: { id: original.id },
  });

  await createProjectActivity(user, 'Project.updated', tmp, tx);

  return tmp;
}

export async function createProjectActivity(
  user: Users,
  action: ActionProject,
  target: Projects,
  tx: Prisma.TransactionClient
): Promise<Activities> {
  const activityGroupId = nanoid();

  return await tx.activities.create({
    data: {
      id: nanoid(),
      action,
      userId: user.id,
      orgId: target.orgId,
      projectId: target.id,
      activityGroupId,
      targetComponentId: target.id,
    },
  });
}
