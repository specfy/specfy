import type { Policies } from '@prisma/client';

import type { ApiPolicy } from '../../types/api';

export function toApiPolicy(policy: Policies): ApiPolicy {
  return {
    id: policy.id,
    orgId: policy.orgId,
    type: policy.type as ApiPolicy['type'],
    tech: policy.tech,
    name: policy.name,
    content: policy.content as unknown as ApiPolicy['content'],
    createdAt: policy.createdAt.toISOString(),
    updatedAt: policy.updatedAt.toISOString(),
  };
}
