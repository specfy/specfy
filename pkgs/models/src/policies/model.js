import { nanoid } from '@specfy/core';
export async function createPoliciesActivity({ user, action, target, tx, activityGroupId = null, }) {
    return await tx.activities.create({
        data: {
            id: nanoid(),
            action,
            userId: user.id,
            orgId: target.orgId,
            activityGroupId,
            targetPolicyId: target.id,
            createdAt: new Date(),
        },
    });
}
