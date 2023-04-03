import { Prisma } from '@prisma/client';
import type { Activities, Components, Users } from '@prisma/client';

import { nanoid } from '../common/id';
import { slugify } from '../common/string';
import type { ActionComponent } from '../types/db';

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
      orgId: blob.orgId,
      projectId: blob.projectId,
      parentId: blob?.blobId || null,
      type: 'component',
      typeId: blob.id,
      blob: data?.deleted ? Prisma.DbNull : (blob as any),
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
  await createComponentActivity(user, 'Component.created', tmp, tx);

  return tmp;
}

export async function createComponentActivity(
  user: Users,
  action: ActionComponent,
  target: Components,
  tx: Prisma.TransactionClient
): Promise<Activities> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const activityGroupId = nanoid();

  return await tx.activities.create({
    data: {
      id: nanoid(),
      action,
      userId: user.id,
      orgId: target.orgId,
      projectId: target.projectId,
      activityGroupId,
      targetComponentId: target.id,
    },
  });
}
