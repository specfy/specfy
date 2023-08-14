export function toApiProject(proj) {
    return {
        id: proj.id,
        orgId: proj.orgId,
        blobId: proj.blobId,
        description: proj.description,
        name: proj.name,
        slug: proj.slug,
        links: proj.links,
        config: proj.config,
        githubRepository: proj.githubRepository,
        createdAt: proj.createdAt.toISOString(),
        updatedAt: proj.updatedAt.toISOString(),
    };
}
export function toApiProjectList(proj) {
    return {
        id: proj.id,
        orgId: proj.orgId,
        name: proj.name,
        slug: proj.slug,
        githubRepository: proj.githubRepository,
        createdAt: proj.createdAt.toISOString(),
        updatedAt: proj.updatedAt.toISOString(),
        users: proj._count.Perms,
    };
}
