import type { Policies } from '@specfy/db';

import type { ApiPolicy } from './types.api.js';

export function toApiPolicy(policy: Policies): ApiPolicy {
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
