import { envs, nanoid } from '@specfy/core';
import JWT from 'jsonwebtoken';
export function getJwtToken(user, expiresAt) {
    return JWT.sign({
        id: user.id,
        expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
        type: 'session',
    }, envs.JWT_SECRET);
}
export async function createUserActivity({ user, action, target, orgId, tx, activityGroupId = null, }) {
    return await tx.activities.create({
        data: {
            id: nanoid(),
            action,
            userId: user.id,
            orgId: orgId,
            projectId: null,
            activityGroupId,
            targetUserId: target.id,
            createdAt: new Date(),
        },
    });
}
export const userGithubApp = {
    id: 'githubapp',
    name: 'Github App',
    email: 'support+githubapp@specfy.io',
    githubLogin: null,
    password: null,
    avatarUrl: '/github-mark.png',
    createdAt: new Date('2023-01-01T00:00:01'),
    updatedAt: new Date('2023-01-01T00:00:01'),
    emailVerifiedAt: new Date('2023-01-01T00:00:01'),
};
