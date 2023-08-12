import type { Orgs } from '@prisma/client';

import type { ApiOrg, ApiOrgPublic } from '../../types/api/index.js';

export function toApiOrgPublic(org: Orgs): ApiOrgPublic {
  return {
    id: org.id,
    name: org.name,
    avatarUrl: org.avatarUrl,
    acronym: org.acronym,
    color: org.color,
  };
}

export function toApiOrgList(org: Orgs): ApiOrg {
  return {
    id: org.id,
    flowId: org.flowId!,
    name: org.name,
    avatarUrl: org.avatarUrl,
    acronym: org.acronym,
    color: org.color,
    githubInstallationId: org.githubInstallationId,
  };
}
