import { nanoid, slugify } from '@specfy/core';
export async function createComponentBlob({ data, blob, tx, }) {
    return await tx.blobs.create({
        data: {
            id: nanoid(),
            parentId: blob.blobId || null,
            type: 'component',
            typeId: blob.id,
            current: blob,
            created: false,
            deleted: false,
            ...data,
        },
    });
}
export async function createComponent({ data, user, tx, }) {
    const body = {
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
    const model = {
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
export async function createComponentActivity({ user, action, target, tx, activityGroupId = null, }) {
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
