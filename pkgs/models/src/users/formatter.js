import { getJwtToken } from './model.js';
export function toApiUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
    };
}
export function toApiUserPublic(user) {
    return {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        githubLogin: user.githubLogin,
    };
}
export function toApiMe(user, perms) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        token: getJwtToken(user, new Date(Date.now() + 3600 * 1000)),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        perms: perms.map((perm) => {
            return { orgId: perm.orgId, projectId: perm.projectId, role: perm.role };
        }),
    };
}
