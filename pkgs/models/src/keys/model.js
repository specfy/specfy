import { nanoid } from '@specfy/core';
export async function createKey({ tx, user, data, activityGroupId = null, }) {
    const id = `spfy_${nanoid(24)}`;
    const tmp = await tx.keys.create({
        data: {
            ...data,
            userId: user.id,
            id,
        },
    });
    await createKeyActivity({
        user,
        action: 'Key.created',
        target: tmp,
        tx,
        activityGroupId,
    });
    return tmp;
}
export async function createKeyActivity({ user, action, target, tx, activityGroupId = null, }) {
    return await tx.activities.create({
        data: {
            id: nanoid(),
            action,
            userId: user.id,
            orgId: target.orgId,
            projectId: target.projectId,
            activityGroupId,
            createdAt: new Date(),
        },
    });
}
