import { Prisma } from '@prisma/client';
import type { Activities, Documents, Users } from '@prisma/client';
import slugify from 'slugify';

import { nanoid } from '../common/id';
import type { ActionDocument } from '../types/db';

export async function createDocumentBlob({
  blob,
  data,
  tx,
}: {
  blob: Documents | Prisma.DocumentsUncheckedCreateInput;
  data?: Partial<Pick<Prisma.BlobsCreateInput, 'created' | 'deleted'>>;
  tx: Prisma.TransactionClient;
}) {
  return await tx.blobs.create({
    data: {
      id: nanoid(),
      orgId: blob.orgId,
      projectId: blob.projectId,
      parentId: blob?.blobId || null,
      type: 'document',
      typeId: blob.id,
      blob: data?.deleted ? Prisma.DbNull : (blob as any),
      created: false,
      deleted: false,
      ...data,
    },
  });
}

export async function createDocument({
  data,
  user,
  tx,
}: {
  data: Omit<Prisma.DocumentsUncheckedCreateInput, 'blobId' | 'slug'>;
  user: Users;
  tx: Prisma.TransactionClient;
}) {
  const body: Prisma.DocumentsUncheckedCreateInput = {
    ...data,
    slug: slugify(data.name, { lower: true, trim: true }),
    id: data.id || nanoid(),
    blobId: null,
  };
  const blob = await createDocumentBlob({
    blob: body,
    data: { created: true },
    tx,
  });
  const model: Prisma.DocumentsUncheckedCreateInput = {
    ...body,
    blobId: blob.id,
  };

  const tmp = await tx.documents.create({
    data: model,
  });
  await createDocumentActivity(user, 'Document.created', tmp, tx);

  return tmp;
}

export async function createDocumentActivity(
  user: Users,
  action: ActionDocument,
  target: Documents,
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
      activityGroupId,
      targetDocumentId: target.id,
    },
  });
}
