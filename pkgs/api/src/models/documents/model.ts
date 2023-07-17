import type { Prisma, Activities, Documents, Users } from '@prisma/client';

import { nanoid } from '../../common/id.js';
import { slugify } from '../../common/string.js';
import type { ActionDocument } from '../activities/types.js';

export async function getDocumentTypeId({
  data,
  tx,
}: {
  data: Pick<Documents, 'orgId' | 'projectId' | 'type'>;
  tx: Prisma.TransactionClient;
}) {
  const count = await tx.documents.count({
    where: { orgId: data.orgId, projectId: data.projectId, type: data.type },
  });
  return count + 1;
}

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
      parentId: blob.blobId || null,
      type: 'document',
      typeId: blob.id,
      current: blob as any,
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
    slug: slugify(data.name),
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
  await createDocumentActivity({
    user,
    action: 'Document.created',
    target: tmp,
    tx,
  });

  return tmp;
}

export async function createDocumentActivity({
  user,
  action,
  target,
  tx,
  activityGroupId = null,
}: {
  user: Users;
  action: ActionDocument;
  target: Documents;
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
