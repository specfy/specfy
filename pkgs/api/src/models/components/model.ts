import type { Prisma, Activities, Components, Users } from '@prisma/client';

import { nanoid } from '../../common/id.js';
import { slugify } from '../../common/string.js';
import type { ActionComponent } from '../activities/types.js';

export async function createComponentBlob({
  data,
  blob,
  tx,
}: {
  data?: Partial<Pick<Prisma.BlobsCreateInput, 'created' | 'deleted'>>;
  blob: Components | Prisma.ComponentsUncheckedCreateInput;
  tx: Prisma.TransactionClient;
}) {
  return await tx.blobs.create({
    data: {
      id: nanoid(),
      parentId: blob.blobId || null,
      type: 'component',
      typeId: blob.id,
      current: blob as any,
      created: false,
      deleted: false,
      ...data,
    },
  });
}

export async function createComponent({
  data,
  user,
  tx,
}: {
  data: Omit<Prisma.ComponentsUncheckedCreateInput, 'blobId' | 'slug'>;
  user: Users;
  tx: Prisma.TransactionClient;
}) {
  const body: Prisma.ComponentsUncheckedCreateInput = {
    show: true,
    tags: [],
    ...data,
    slug: slugify(data.name),
    id: data.id || nanoid(),
    blobId: null,
  };
  const blob = await createComponentBlob({
    data: { created: true },
    blob: body,
    tx,
  });
  const model: Prisma.ComponentsUncheckedCreateInput = {
    ...body,
    blobId: blob.id,
  };

  const tmp = await tx.components.create({
    data: model,
  });
  await createComponentActivity({
    user,
    action: 'Component.created',
    target: tmp,
    tx,
  });

  return tmp;
}

export async function createComponentActivity({
  user,
  action,
  target,
  tx,
  activityGroupId = null,
}: {
  user: Users;
  action: ActionComponent;
  target: Components;
  tx: Prisma.TransactionClient;
  activityGroupId?: string | null;
}): Promise<Activities> {
  return await tx.activities.create({
    data: {
      id: nanoid(),
      action,
      userId: user.id,
      orgId: target.orgId,
      projectId: target.projectId,
      activityGroupId,
      targetBlobId: target.blobId,
      createdAt: new Date(),
    },
  });
}
