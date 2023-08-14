export function getOrgFromRequest(req, orgId) {
    return req.perms.find((p) => p.orgId === orgId && p.projectId === null)?.Org;
}
export function checkInheritedPermissions(perms, role, orgId, projectId) {
    const exactMatch = perms.find((perm) => {
        return (perm.orgId === orgId &&
            (projectId ? perm.projectId === projectId : perm.projectId === null));
    });
    if (exactMatch) {
        return isRoleOrAbove(exactMatch, role);
    }
    if (projectId) {
        const inherited = perms.find((perm) => {
            return perm.orgId === orgId;
        });
        if (inherited?.Org.Projects.find((project) => project.id === projectId)) {
            return isRoleOrAbove(inherited, role);
        }
    }
    return false;
}
export function isRoleOrAbove(perm, role) {
    return perm.role === role || perm.role === 'owner' || role === 'viewer';
}
