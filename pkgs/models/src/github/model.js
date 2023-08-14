import { nanoid } from '@specfy/core';
export async function createGithubActivity({ user, action, org, project, tx, activityGroupId = null, }) {
    return await tx.activities.create({
        data: {
            id: nanoid(),
            action,
            userId: user.id,
            orgId: org.id,
            projectId: project?.id || null,
            activityGroupId,
            createdAt: new Date(),
        },
    });
}
