import { nanoid, slugify } from '@specfy/core';
import { createKey } from '../keys/model.js';
export async function createProjectBlob({ data, blob, tx, }) {
    return await tx.blobs.create({
        data: {
            id: nanoid(),
            parentId: blob.blobId || null,
            type: 'project',
            typeId: blob.id,
            current: blob,
            created: false,
            deleted: false,
            ...data,
        },
    });
}
export async function createProject({ data, user, tx, }) {
    const body = {
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
export async function createProjectActivity({ user, action, target, tx, activityGroupId = null, }) {
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
export function getDefaultConfig() {
    return {
        branch: 'main',
        documentation: {
            enabled: true,
            path: '/docs',
        },
        stack: {
            enabled: true,
            path: '/',
        },
    };
}
