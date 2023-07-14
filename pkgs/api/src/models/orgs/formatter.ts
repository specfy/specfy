import type { Orgs } from '@prisma/client';

import type { ApiOrg } from '../../types/api/index.js';

export function toApiOrg(org: Orgs): ApiOrg {
  return {
    id: org.id,
    flowId: org.flowId!,
    isPersonal: org.isPersonal,
    name: org.name,
    avatarUrl: org.avatarUrl,
    acronym: org.acronym,
    color: org.color,
    githubInstallationId: org.githubInstallationId,
  };
}
