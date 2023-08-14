export function toApiPolicy(policy) {
    return {
        id: policy.id,
        orgId: policy.orgId,
        type: policy.type,
        tech: policy.tech,
        name: policy.name,
        content: policy.content,
        createdAt: policy.createdAt.toISOString(),
        updatedAt: policy.updatedAt.toISOString(),
    };
}
