export function toApiOrgPublic(org) {
    return {
        id: org.id,
        name: org.name,
        avatarUrl: org.avatarUrl,
        acronym: org.acronym,
        color: org.color,
    };
}
export function toApiOrgList(org) {
    return {
        id: org.id,
        flowId: org.flowId,
        name: org.name,
        avatarUrl: org.avatarUrl,
        acronym: org.acronym,
        color: org.color,
        githubInstallationId: org.githubInstallationId,
    };
}
