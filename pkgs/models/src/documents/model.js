import { nanoid, slugify } from '@specfy/core';
export async function getDocumentTypeId({ data, tx, }) {
    const count = await tx.documents.count({
        where: { orgId: data.orgId, projectId: data.projectId, type: data.type },
    });
    return count + 1;
}
export async function createDocumentBlob({ blob, data, tx, }) {
    return await tx.blobs.create({
        data: {
            id: nanoid(),
            parentId: blob.blobId || null,
            type: 'document',
            typeId: blob.id,
            current: blob,
            created: false,
            deleted: false,
            ...data,
        },
    });
}
export async function createDocument({ data, user, tx, }) {
    const body = {
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
    const model = {
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
export async function createDocumentActivity({ user, action, target, tx, activityGroupId = null, }) {
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
