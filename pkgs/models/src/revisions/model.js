import { nanoid } from '@specfy/core';
export async function createRevisionActivity({ user, action, target, tx, activityGroupId = null, }) {
    return await tx.activities.create({
        data: {
            id: nanoid(),
            action,
            userId: user.id,
            orgId: target.orgId,
            projectId: target.projectId,
            activityGroupId,
            targetRevisionId: target.id,
            createdAt: new Date(),
        },
    });
}
export async function createBlobs(blobs, tx) {
    const ids = [];
    for (const blob of blobs) {
        const b = await tx.blobs.create({
            data: {
                id: nanoid(),
                ...blob,
                current: blob.current,
            },
        });
        ids.push(b.id);
    }
    return ids;
}
